import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { Errors } from '@shared/errors.js';
import { UserUpdateDto } from './user.model.js';
import { updateUser } from './user.repository.js';

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  const pathUid = event.pathParameters?.uid;
  if (!userId || userId !== pathUid) {
    throw Errors.forbidden;
  }

  const body = JSON.parse(event.body || '{}') as UserUpdateDto;
  if (!body.firstName || !body.lastName || !body.displayName || !body.avatarColor) {
    throw Errors.missingFields;
  }

  const user = await updateUser(userId, body);
  return createResponse(200, user);
});
