import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';

/** Deletes a collection. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    return createResponse(400, { message: 'Missing collection id' });
  }

  try {
    const deleteResult = await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: userPk(userId),
          SK: collectionSk(collectionId),
        },
        ReturnValues: 'ALL_OLD',
      }),
    );

    if (!deleteResult.Attributes) {
      return createResponse(404, { message: 'Collection not found' });
    }

    return createResponse(200, { message: 'Collection successfully deleted' });
  } catch (err) {
    console.error('Error deleting collection', err);
    return createResponse(500, { message: 'Error deleting collection' });
  }
};
