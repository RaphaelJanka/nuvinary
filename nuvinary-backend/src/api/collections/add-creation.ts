import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { collectionSk, creationSk, userPk } from '@shared/db-keys.js';
import { AddCreationToCollectionDto, CollectionItem } from '../../models/collection.model.js';
import { Errors } from '@shared/errors.js';

const MAX_CREATIONS_PER_COLLECTION = 10;

/** Adds a creation to a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

  const body = JSON.parse(event.body || '{}') as AddCreationToCollectionDto;
  if (!body.creationId?.trim()) {
    throw Errors.creationIdRequired;
  }

  const collectionItem = await getCollectionItem(userId, collectionId);
  if (!collectionItem) {
    throw Errors.collectionNotFound;
  }

  const creationExists = await checkCreationExists(userId, body.creationId);
  if (!creationExists) {
    throw Errors.creationNotFound;
  }

  if (collectionItem.creationIds.includes(body.creationId)) {
    throw Errors.alreadyInCollection;
  }

  if (collectionItem.creationIds.length >= MAX_CREATIONS_PER_COLLECTION) {
    throw Errors.maxCreationsInCollectionReached(MAX_CREATIONS_PER_COLLECTION);
  }

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
        UpdateExpression: 'SET creationIds = list_append(creationIds, :newId)',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':newId': [body.creationId] },
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw Errors.collectionNotFound;
    }
    throw err;
  }

  return createResponse(200, { message: 'Creation added to collection' });
});

/** Fetches the collection item, or undefined if it doesn't exist. */
async function getCollectionItem(
  userId: string,
  collectionId: string,
): Promise<CollectionItem | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
    }),
  );
  return result.Item as CollectionItem | undefined;
}

/** Checks whether the referenced creation exists and belongs to the user. */
async function checkCreationExists(userId: string, creationId: string): Promise<boolean> {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
    }),
  );
  return result.Item !== undefined;
}
