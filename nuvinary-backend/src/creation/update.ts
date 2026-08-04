import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { getUserIdOrThrow } from '@shared/auth.js';
import { Errors } from '@shared/errors.js';
import { CreationUpdateDto } from './creation.model.js';
import { setCreationPrivate, setCreationPublic, updateCreationTitle } from './creation.repository.js';

/** Updates a creation's title or visibility, whichever is present in the body. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = getUserIdOrThrow(event);

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    throw Errors.missingCreationId;
  }

  const body = JSON.parse(event.body || '{}') as CreationUpdateDto;
  if (body.title === undefined && body.isPublic === undefined) {
    throw Errors.missingFields;
  }

  if (body.title !== undefined) {
    await updateCreationTitle(userId, creationId, body.title);
    return createResponse(200, { message: 'Title successfully changed' });
  }

  if (body.isPublic) {
    await setCreationPublic(userId, creationId, body.isPublic);
  } else {
    await setCreationPrivate(userId, creationId, body.isPublic ?? false);
  }
  return createResponse(200, { message: 'Visibility successfully changed' });
});
