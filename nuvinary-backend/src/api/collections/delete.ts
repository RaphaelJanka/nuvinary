import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

/** Deletes a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

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
    throw Errors.collectionNotFound;
  }

  return createResponse(200, { message: 'Collection successfully deleted' });
});
