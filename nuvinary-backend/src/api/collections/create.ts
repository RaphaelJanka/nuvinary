import { randomUUID } from 'node:crypto';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { COLLECTION_SK_PREFIX, collectionSk, userPk } from '@shared/db-keys.js';
import {
  CollectionItem,
  CollectionResponse,
  CollectionTitleDto,
} from '../../models/collection.model.js';
import { Errors } from '@shared/errors.js';

const MAX_COLLECTIONS_PER_USER = 8;

/** Creates a new empty collection for the authenticated user. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const body = JSON.parse(event.body || '{}') as CollectionTitleDto;
  if (!body.title?.trim()) {
    throw Errors.titleRequired;
  }

  const collectionCount = await countCollections(userId);
  if (collectionCount >= MAX_COLLECTIONS_PER_USER) {
    throw Errors.maxCollectionsReached(MAX_COLLECTIONS_PER_USER);
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
});

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
  body: CollectionTitleDto,
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
