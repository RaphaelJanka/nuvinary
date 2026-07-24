import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient } from '@shared/api-utils.js';
import { s3Client } from '@shared/s3-utils.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/** Deletes a creation's DynamoDB item and its S3 image. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    return createResponse(400, { message: 'Missing creation id' });
  }

  try {
    const deleteResult = await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `CREATION#${creationId}`,
        },
        ReturnValues: 'ALL_OLD',
      }),
    );

    const imageKey = deleteResult.Attributes?.imageKey;
    if (!imageKey) {
      return createResponse(404, { message: 'Creation not found' });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey,
      }),
    );

    return createResponse(200, { message: 'Creation successfully deleted' });
  } catch (err) {
    console.error('Error deleting creation:', err);
    return createResponse(500, { message: 'Internal server error' });
  }
};
