import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { CreationItem, CreationResponse } from '../models/creation.model.js';

/** Lists the authenticated user's creations, newest first, with presigned image URLs. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'CREATION#',
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
  } catch (err) {
    console.error('Error listing creations:', err);
    return createResponse(500, { message: 'Error listing creations' });
  }
};
