import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { collectionSk, creationSk, userPk } from '@shared/db-keys.js';
import { AddCreationToCollectionDto, CollectionItem } from '../../models/collection.model.js';

const MAX_CREATIONS_PER_COLLECTION = 10;

/** Adds a creation to a collection. */
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

  const body = JSON.parse(event.body || '{}') as AddCreationToCollectionDto;
  if (!body.creationId?.trim()) {
    return createResponse(400, { message: 'Creation id is required' });
  }

  try {
    const collectionItem = await getCollectionItem(userId, collectionId);
    if (!collectionItem) {
      return createResponse(404, { message: 'Collection not found' });
    }

    const creationExists = await checkCreationExists(userId, body.creationId);
    if (!creationExists) {
      return createResponse(404, { message: 'Creation not found' });
    }

    if (collectionItem.creationIds.includes(body.creationId)) {
      return createResponse(409, { message: 'Already in this collection' });
    }

    if (collectionItem.creationIds.length >= MAX_CREATIONS_PER_COLLECTION) {
      return createResponse(403, {
        message: `You can only have up to ${MAX_CREATIONS_PER_COLLECTION} creations in a collection`,
      });
    }

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
        UpdateExpression: 'SET creationIds = list_append(creationIds, :newId)',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: { ':newId': [body.creationId] },
      }),
    );

    return createResponse(200, { message: 'Creation added to collection' });
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return createResponse(404, { message: 'Collection not found' });
    }
    console.error('Error adding creation to collection:', err);
    return createResponse(500, { message: 'Error adding creation to collection' });
  }
};

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
