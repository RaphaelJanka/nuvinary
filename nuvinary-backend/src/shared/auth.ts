import { APIGatewayProxyEvent } from 'aws-lambda';
import { Errors } from './errors.js';

/** Extracts the authenticated user's id from the request, or throws if it's missing. */
export function getUserIdOrThrow(event: APIGatewayProxyEvent): string {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }
  return userId;
}
