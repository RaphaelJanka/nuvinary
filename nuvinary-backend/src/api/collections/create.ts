import { randomUUID } from 'node:crypto';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { COLLECTION_SK_PREFIX, collectionSk, userPk } from '@shared/db-keys.js';
import {
  CollectionItem,
  CollectionResponse,
  CreateCollectionDto,
} from '../../models/collection.model.js';

const MAX_COLLECTIONS_PER_USER = 8;

/** Creates a new empty collection for the authenticated user. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const body = JSON.parse(event.body || '{}') as CreateCollectionDto;
  if (!body.title?.trim()) {
    return createResponse(400, { message: 'Title is required' });
  }

  try {
    const collectionCount = await countCollections(userId);
    if (collectionCount >= MAX_COLLECTIONS_PER_USER) {
      return createResponse(403, {
        message: `You can only have up to ${MAX_COLLECTIONS_PER_USER} collections`,
      });
    }

    const collectionItem = buildCollectionItem(userId, body);
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: collectionItem,
      }),
    );

    const collection: CollectionResponse = {
      id: collectionItem.id,
      createdBy: collectionItem.createdBy,
      title: collectionItem.title,
      createdAt: collectionItem.createdAt,
      creations: [],
    };
    return createResponse(200, collection);
  } catch (err) {
    console.error('Error creating collection:', err);
    return createResponse(500, { message: 'Error creating collection' });
  }
};

/** Counts how many collections the user already has. */
async function countCollections(userId: string): Promise<number> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': userPk(userId),
        ':skPrefix': COLLECTION_SK_PREFIX,
      },
      Select: 'COUNT',
    }),
  );
  return result.Count ?? 0;
}

/** Assembles the DynamoDB item for a new collection. */
function buildCollectionItem(
  userId: string,
  body: CreateCollectionDto,
): CollectionItem {
  const id = randomUUID();
  return {
    PK: userPk(userId),
    SK: collectionSk(id),
    id,
    title: body.title,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    creationIds: [],
  };
}
