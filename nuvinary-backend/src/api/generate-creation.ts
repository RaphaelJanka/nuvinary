import { randomUUID } from 'node:crypto';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ValidationException,
} from '@aws-sdk/client-bedrock-runtime';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { getPresignedImageUrl, s3Client } from '@shared/s3-utils.js';
import {
  CreationItem,
  GenerateCreationDto,
  GenerateCreationResponse,
} from '../models/creation.model.js';
import { User } from '../models/user.model.js';
import { METADATA_SK, creationSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';
import { HttpError } from '@shared/http-error.js';

const bedrockClient = new BedrockRuntimeClient({ region: 'us-west-2' });

const MODEL_ID = 'stability.stable-image-core-v1:1';
const ASPECT_RATIO = '1:1';
const OUTPUT_FORMAT = 'png';

interface StableImageResponse {
  images?: string[];
  finish_reasons?: (string | null)[];
}

/** Generates an image via Bedrock, persists it to S3/DynamoDB, and decrements credits. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const body = JSON.parse(event.body || '{}') as GenerateCreationDto;
  if (!body.title?.trim() || !body.prompt?.trim()) {
    throw Errors.titleAndPromptRequired;
  }

  const user = await getUser(userId);
  if (!user) {
    throw Errors.userNotFound;
  }
  if (user.credits <= 0) {
    throw Errors.noCreditsRemaining;
  }

  let imageBuffer: Buffer;
  try {
    imageBuffer = await generateImage(body.prompt);
  } catch (err) {
    if (err instanceof ValidationException) {
      throw new HttpError(400, err.message);
    }
    throw err;
  }

  const id = randomUUID();
  const imageKey = `creations/${userId}/${id}.png`;
  await uploadImageToS3(imageKey, imageBuffer);

  const creationItem = buildCreationItem(userId, id, imageKey, user, body);
  await saveCreation(creationItem);

  const remainingCredits = await decrementUserCredits(userId, user.credits);
  const url = await getPresignedImageUrl(imageKey);

  const creation: GenerateCreationResponse = {
    id: creationItem.id,
    title: creationItem.title,
    url,
    createdAt: creationItem.createdAt,
    isPublic: creationItem.isPublic,
    createdBy: creationItem.createdBy,
    aiMetadata: creationItem.aiMetadata,
    remainingCredits,
  };

  return createResponse(200, creation);
});

/** Fetches the user's profile/metadata item. */
async function getUser(userId: string): Promise<User | undefined> {
  const userResult = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: METADATA_SK },
    }),
  );
  return userResult.Item as User | undefined;
}

/** Invokes Bedrock's Stable Image Core model and decodes the returned base64 image. */
async function generateImage(prompt: string): Promise<Buffer> {
  const bedrockResponse = await bedrockClient.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt,
        aspect_ratio: ASPECT_RATIO,
        output_format: OUTPUT_FORMAT,
      }),
    }),
  );

  const stableImageResponse = JSON.parse(
    new TextDecoder().decode(bedrockResponse.body),
  ) as StableImageResponse;
  const finishReason = stableImageResponse.finish_reasons?.[0];

  if (finishReason || !stableImageResponse.images?.[0]) {
    throw new HttpError(422, finishReason ?? 'Your prompt could not be turned into an image.');
  }

  return Buffer.from(stableImageResponse.images[0], 'base64');
}

/** Uploads the generated PNG to the creations bucket under the given key. */
async function uploadImageToS3(
  imageKey: string,
  imageBuffer: Buffer,
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: 'image/png',
    }),
  );
}

/** Assembles the DynamoDB item for a new creation. */
function buildCreationItem(
  userId: string,
  id: string,
  imageKey: string,
  user: User,
  body: GenerateCreationDto,
): CreationItem {
  return {
    PK: userPk(userId),
    SK: creationSk(id),
    id,
    title: body.title,
    imageKey,
    createdAt: new Date().toISOString(),
    isPublic: false,
    createdBy: {
      id: userId,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
    },
    aiMetadata: {
      model: MODEL_ID,
      prompt: body.prompt,
    },
  };
}

/** Writes the creation item to DynamoDB. */
async function saveCreation(creationItem: CreationItem): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: creationItem,
    }),
  );
}

/** Atomically decrements credits by 1, guarded against going below 0. */
async function decrementUserCredits(
  userId: string,
  currentCredits: number,
): Promise<number> {
  try {
    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: METADATA_SK },
        UpdateExpression: 'SET credits = credits - :one',
        ConditionExpression: 'credits > :zero',
        ExpressionAttributeValues: { ':one': 1, ':zero': 0 },
        ReturnValues: 'UPDATED_NEW',
      }),
    );
    return updateResult.Attributes?.credits ?? currentCredits - 1;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return 0;
    }
    throw err;
  }
}
