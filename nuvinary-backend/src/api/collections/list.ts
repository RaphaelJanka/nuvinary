import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { COLLECTION_SK_PREFIX, creationSk, userPk } from '@shared/db-keys.js';
import { CollectionCreation, CollectionItem, CollectionResponse } from '../../models/collection.model.js';
import { CreationItem } from '../../models/creation.model.js';
import { Errors } from '@shared/errors.js';

/** Lists the authenticated user's collections, with each creation resolved to a fresh presigned URL. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': userPk(userId),
        ':skPrefix': COLLECTION_SK_PREFIX,
      },
    }),
  );

  const collectionItems = (result.Items ?? []) as CollectionItem[];
  const collections: CollectionResponse[] = [];

  for (const item of collectionItems) {
    collections.push({
      id: item.id,
      createdBy: item.createdBy,
      title: item.title,
      createdAt: item.createdAt,
      creations: await resolveCollectionCreations(userId, item.creationIds),
    });
  }

  return createResponse(200, collections);
});

/** Loads each referenced creation and resolves it to a fresh presigned URL, skipping ids that no longer exist. */
async function resolveCollectionCreations(
  userId: string,
  creationIds: string[],
): Promise<CollectionCreation[]> {
  const creations: CollectionCreation[] = [];

  for (const id of creationIds) {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: creationSk(id) },
      }),
    );

    const item = result.Item as CreationItem | undefined;
    if (!item) continue; // Creation was deleted in the meantime

    creations.push({ id: item.id, url: await getPresignedImageUrl(item.imageKey) });
  }

  return creations;
}
