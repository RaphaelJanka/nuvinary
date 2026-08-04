import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { getCreation } from '../creation/creation.repository.js';
import { AddCreationToCollectionDto } from './collection.model.js';
import { addCreationToCollection, getCollection } from './collection.repository.js';

const MAX_CREATIONS_PER_COLLECTION = 10;

/** Adds a creation to a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

  const body = JSON.parse(event.body || '{}') as AddCreationToCollectionDto;
  if (!body.creationId?.trim()) {
    throw Errors.creationIdRequired;
  }

  const collectionItem = await getCollection(userId, collectionId);
  if (!collectionItem) {
    throw Errors.collectionNotFound;
  }

  const creationItem = await getCreation(userId, body.creationId);
  if (!creationItem) {
    throw Errors.creationNotFound;
  }

  if (collectionItem.creationIds.includes(body.creationId)) {
    throw Errors.alreadyInCollection;
  }

  if (collectionItem.creationIds.length >= MAX_CREATIONS_PER_COLLECTION) {
    throw Errors.maxCreationsInCollectionReached(MAX_CREATIONS_PER_COLLECTION);
  }

  await addCreationToCollection(userId, collectionId, body.creationId);

  return createResponse(200, { message: 'Creation added to collection' });
});
