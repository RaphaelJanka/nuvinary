import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { CollectionItem } from '../../models/collection.model.js';
import { Errors } from '@shared/errors.js';

/** Removes a creation from a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const collectionId = event.pathParameters?.id;
  const creationId = event.pathParameters?.creationId;
  if (!collectionId || !creationId) {
    throw Errors.missingCollectionOrCreationId;
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
    }),
  );
  const collectionItem = result.Item as CollectionItem | undefined;
  if (!collectionItem) {
    throw Errors.collectionNotFound;
  }

  const remainingCreationIds = collectionItem.creationIds.filter((id) => id !== creationId);

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
        UpdateExpression: 'SET creationIds = :ids',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':ids': remainingCreationIds },
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw Errors.collectionNotFound;
    }
    throw err;
  }

  return createResponse(200, { message: 'Creation removed from collection' });
});
