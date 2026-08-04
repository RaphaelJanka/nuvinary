import { randomUUID } from 'node:crypto';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';
import { CollectionItem, CollectionResponse, CollectionTitleDto } from './collection.model.js';
import { countCollections, saveCollection } from './collection.repository.js';

const MAX_COLLECTIONS_PER_USER = 8;

/** Creates a new empty collection for the authenticated user. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const body = JSON.parse(event.body || '{}') as CollectionTitleDto;
  if (!body.title?.trim()) {
    throw Errors.titleRequired;
  }

  const collectionCount = await countCollections(userId);
  if (collectionCount >= MAX_COLLECTIONS_PER_USER) {
    throw Errors.maxCollectionsReached(MAX_COLLECTIONS_PER_USER);
  }

  const collectionItem = buildCollectionItem(userId, body);
  await saveCollection(collectionItem);

  const collection: CollectionResponse = {
    id: collectionItem.id,
    createdBy: collectionItem.createdBy,
    title: collectionItem.title,
    createdAt: collectionItem.createdAt,
    creations: [],
  };
  return createResponse(200, collection);
});

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
