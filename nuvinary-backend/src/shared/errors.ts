import { HttpError } from './http-error.js';

/** Named HTTP errors shared across handlers, so each use case's status code and message live in one place. */
export const Errors = {
  missingUserId: new HttpError(401, 'User ID not found'),
  forbidden: new HttpError(403, 'Forbidden'),

  missingCreationId: new HttpError(400, 'Missing creation id'),
  missingCollectionId: new HttpError(400, 'Missing collection id'),
  missingCollectionOrCreationId: new HttpError(400, 'Missing collection or creation id'),
  missingFields: new HttpError(400, 'Missing required fields'),
  titleRequired: new HttpError(400, 'Title is required'),
  creationIdRequired: new HttpError(400, 'Creation id is required'),
  titleAndPromptRequired: new HttpError(400, 'Title and prompt are required'),

  userNotFound: new HttpError(404, 'User not found'),
  creationNotFound: new HttpError(404, 'Creation not found'),
  collectionNotFound: new HttpError(404, 'Collection not found'),

  noCreditsRemaining: new HttpError(403, 'No credits remaining'),
  alreadyInCollection: new HttpError(409, 'Already in this collection'),

  maxCollectionsReached: (max: number) =>
    new HttpError(403, `You can only have up to ${max} collections`),
  maxCreationsInCollectionReached: (max: number) =>
    new HttpError(403, `You can only have up to ${max} creations in a collection`),
} as const;
