import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { CollectionTitleDto } from './collection.model.js';
import { updateCollectionTitle } from './collection.repository.js';

/** Updates a collection's title. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

  const body = JSON.parse(event.body || '{}') as CollectionTitleDto;
  if (!body.title?.trim()) {
    throw Errors.titleRequired;
  }

  await updateCollectionTitle(userId, collectionId, body.title);

  return createResponse(200, { message: 'Collection title successfully updated' });
});
