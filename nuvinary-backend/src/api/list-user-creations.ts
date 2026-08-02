import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { CreationItem, CreationResponse } from '../models/creation.model.js';
import { CREATION_SK_PREFIX, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

/** Lists the authenticated user's creations, newest first, with presigned image URLs. */
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
        ':skPrefix': CREATION_SK_PREFIX,
      },
    }),
  );

  const items = (result.Items ?? []) as CreationItem[];
  const creations: CreationResponse[] = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      title: item.title,
      url: await getPresignedImageUrl(item.imageKey),
      createdAt: item.createdAt,
      isPublic: item.isPublic,
      createdBy: item.createdBy,
      aiMetadata: item.aiMetadata,
    })),
  );

  creations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return createResponse(200, creations);
});
