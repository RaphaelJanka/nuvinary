import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { getUser } from './user.repository.js';

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const user = await getUser(userId);
  if (!user) {
    throw Errors.userNotFound;
  }

  return createResponse(200, user);
});
