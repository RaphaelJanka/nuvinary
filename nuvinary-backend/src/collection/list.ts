import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { getCreation } from '../creation/creation.repository.js';
import { CollectionCreation, CollectionResponse } from './collection.model.js';
import { listCollections } from './collection.repository.js';

/** Lists the authenticated user's collections, with each creation resolved to a fresh presigned URL. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const collectionItems = await listCollections(userId);
  const collections: CollectionResponse[] = [];

  for (const item of collectionItems) {
    collections.push({
      id: item.id,
      createdBy: item.createdBy,
      title: item.title,
      createdAt: item.createdAt,
      creations: await resolveCollectionCreations(userId, item.creationIds),
    });
  }

  return createResponse(200, collections);
});

/** Loads each referenced creation and resolves it to a fresh presigned URL, skipping ids that no longer exist. */
async function resolveCollectionCreations(
  userId: string,
  creationIds: string[],
): Promise<CollectionCreation[]> {
  const creations: CollectionCreation[] = [];

  for (const id of creationIds) {
    const item = await getCreation(userId, id);
    if (!item) continue; // Creation was deleted in the meantime

    creations.push({ id: item.id, url: await getPresignedImageUrl(item.imageKey) });
  }

  return creations;
}
