import { randomUUID } from 'node:crypto';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ValidationException,
} from '@aws-sdk/client-bedrock-runtime';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { getPresignedImageUrl, s3Client } from '@shared/s3-utils.js';
import {
  CreationItem,
  GenerateCreationDto,
  GenerateCreationResponse,
} from '../models/creation.model.js';
import { User } from '../models/user.model.js';

const bedrockClient = new BedrockRuntimeClient({ region: 'us-west-2' });

const MODEL_ID = 'stability.stable-image-core-v1:1';
const ASPECT_RATIO = '1:1';
const OUTPUT_FORMAT = 'png';

interface StableImageResponse {
  images?: string[];
  finish_reasons?: (string | null)[];
}

class NoImageGeneratedError extends Error {}

/**
 * Generates a new image via Bedrock Stable Image Core for the authenticated user,
 * persists it to S3/DynamoDB, decrements the user's credits, and returns a presigned
 * URL for the freshly created image.
 */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const body = JSON.parse(event.body || '{}') as GenerateCreationDto;
  if (!body.title?.trim() || !body.prompt?.trim()) {
    return createResponse(400, { message: 'Title and prompt are required' });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return createResponse(404, { message: 'User not found' });
    }
    if (user.credits <= 0) {
      return createResponse(403, { message: 'No credits remaining' });
    }

    let imageBuffer: Buffer;
    try {
      imageBuffer = await generateImage(body.prompt);
    } catch (err) {
      if (err instanceof NoImageGeneratedError) {
        return createResponse(422, { message: err.message });
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
  } catch (err) {
    if (err instanceof ValidationException) {
      return createResponse(400, { message: err.message });
    }
    console.error('Error generating image:', err);
    return createResponse(500, { message: 'Error generating image' });
  }
};

/** Fetches the user's profile/metadata item (`PK: USER#<id>`, `SK: METADATA`), used for the credit check. */
async function getUser(userId: string): Promise<User | undefined> {
  const userResult = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
    }),
  );
  return userResult.Item as User | undefined;
}

/**
 * Invokes Bedrock's Stable Image Core model and decodes the base64 image it returns.
 * @throws {NoImageGeneratedError} if the model refused the prompt or returned no image.
 */
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
    console.error('Stable Image Core returned no image', stableImageResponse);
    throw new NoImageGeneratedError(
      finishReason ?? 'Your prompt could not be turned into an image.',
    );
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

/** Assembles the DynamoDB item for a new creation (`PK: USER#<id>`, `SK: CREATION#<id>`). */
function buildCreationItem(
  userId: string,
  id: string,
  imageKey: string,
  user: User,
  body: GenerateCreationDto,
): CreationItem {
  return {
    PK: `USER#${userId}`,
    SK: `CREATION#${id}`,
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

/**
 * Atomically decrements the user's credits by 1, guarded by `credits > 0` so concurrent
 * requests can't drive the balance negative. Returns 0 if the condition failed (race lost).
 */
async function decrementUserCredits(
  userId: string,
  currentCredits: number,
): Promise<number> {
  try {
    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: 'METADATA' },
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
