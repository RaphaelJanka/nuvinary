import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { s3Client } from '@shared/s3-utils.js';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { creationSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

/** Deletes a creation's DynamoDB item and its S3 image. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    throw Errors.missingCreationId;
  }

  const deleteResult = await docClient.send(
    new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: userPk(userId),
        SK: creationSk(creationId),
      },
      ReturnValues: 'ALL_OLD',
    }),
  );

  const imageKey = deleteResult.Attributes?.imageKey;
  if (!imageKey) {
    throw Errors.creationNotFound;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: imageKey,
    }),
  );

  return createResponse(200, { message: 'Creation successfully deleted' });
});
