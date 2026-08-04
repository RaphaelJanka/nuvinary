import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { deleteCollection } from './collection.repository.js';

/** Deletes a collection. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

  const deletedItem = await deleteCollection(userId, collectionId);
  if (!deletedItem) {
    throw Errors.collectionNotFound;
  }

  return createResponse(200, { message: 'Collection successfully deleted' });
});
