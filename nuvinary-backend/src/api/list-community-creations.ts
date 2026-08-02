import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { CreationItem, CreationResponse } from '../models/creation.model.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { COMMUNITY_GSI1PK } from '@shared/db-keys.js';

/** Lists all public creations across all users, newest first, with presigned image URLs. */
export const handler = withErrorHandling(async () => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'CreationIndex',
      KeyConditionExpression: 'GSI1PK = :gpk',
      ExpressionAttributeValues: {
        ':gpk': COMMUNITY_GSI1PK,
      },
      ScanIndexForward: false,
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

  return createResponse(200, creations);
});
