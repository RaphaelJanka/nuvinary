import { randomUUID } from 'node:crypto';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ValidationException,
} from '@aws-sdk/client-bedrock-runtime';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getPresignedImageUrl, s3Client } from '@shared/s3-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { creationSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';
import { HttpError } from '@shared/http-error.js';
import { CreationItem, GenerateCreationDto, GenerateCreationResponse } from './creation.model.js';
import { saveCreation } from './creation.repository.js';
import { decrementCredits, getUser } from '../user/user.repository.js';
import { User } from '../user/user.model.js';

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
  const userId = getUserIdOrThrow(event);

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

  const remainingCredits = await decrementCredits(userId, user.credits);
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
