import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { CreationResponse } from './creation.model.js';
import { listUserCreations, toCreationResponse } from './creation.repository.js';

/** Lists the authenticated user's creations, newest first, with presigned image URLs. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const items = await listUserCreations(userId);
  const creations: CreationResponse[] = await Promise.all(items.map(toCreationResponse));
  creations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return createResponse(200, creations);
});
