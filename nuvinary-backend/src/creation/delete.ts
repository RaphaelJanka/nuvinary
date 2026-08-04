import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { s3Client } from '@shared/s3-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { deleteCreation } from './creation.repository.js';

/** Deletes a creation's DynamoDB item and its S3 image. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    throw Errors.missingCreationId;
  }

  const deletedItem = await deleteCreation(userId, creationId);
  if (!deletedItem?.imageKey) {
    throw Errors.creationNotFound;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: deletedItem.imageKey,
    }),
  );

  return createResponse(200, { message: 'Creation successfully deleted' });
});
