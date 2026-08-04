import { createResponse, withErrorHandling } from '@shared/api-utils.js';
import { CreationResponse } from './creation.model.js';
import { listCommunityCreations, toCreationResponse } from './creation.repository.js';

/** Lists all public creations across all users, newest first, with presigned image URLs. */
export const handler = withErrorHandling(async () => {
  const items = await listCommunityCreations();
  const creations: CreationResponse[] = await Promise.all(items.map(toCreationResponse));

  return createResponse(200, creations);
});
