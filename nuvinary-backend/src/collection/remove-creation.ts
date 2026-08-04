import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { getCollection, setCollectionCreationIds } from './collection.repository.js';

/** Removes a creation from a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const collectionId = event.pathParameters?.id;
  const creationId = event.pathParameters?.creationId;
  if (!collectionId || !creationId) {
    throw Errors.missingCollectionOrCreationId;
  }

  const collectionItem = await getCollection(userId, collectionId);
  if (!collectionItem) {
    throw Errors.collectionNotFound;
  }

  const remainingCreationIds = collectionItem.creationIds.filter((id) => id !== creationId);
  await setCollectionCreationIds(userId, collectionId, remainingCreationIds);

  return createResponse(200, { message: 'Creation removed from collection' });
});
