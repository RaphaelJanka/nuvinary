import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { CollectionItem } from '../../models/collection.model.js';

/** Removes a creation from a collection. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const collectionId = event.pathParameters?.id;
  const creationId = event.pathParameters?.creationId;
  if (!collectionId || !creationId) {
    return createResponse(400, { message: 'Missing collection or creation id' });
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
      }),
    );
    const collectionItem = result.Item as CollectionItem | undefined;
    if (!collectionItem) {
      return createResponse(404, { message: 'Collection not found' });
    }

    const remainingCreationIds = collectionItem.creationIds.filter((id) => id !== creationId);

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
        UpdateExpression: 'SET creationIds = :ids',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':ids': remainingCreationIds },
      }),
    );

    return createResponse(200, { message: 'Creation removed from collection' });
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return createResponse(404, { message: 'Collection not found' });
    }
    console.error('Error removing creation from collection:', err);
    return createResponse(500, { message: 'Error removing creation from collection' });
  }
};
