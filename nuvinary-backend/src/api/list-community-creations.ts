import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient } from '@shared/api-utils.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreationItem, CreationResponse } from '../models/creation.model.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';

/** Lists all public creations across all users, newest first, with presigned image URLs. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: 'CreationIndex',
        KeyConditionExpression: 'GSI1PK = :gpk',
        ExpressionAttributeValues: {
          ':gpk': 'PUBLIC',
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
  } catch (err) {
    console.error('Error listing creations:', err);
    return createResponse(500, { message: 'Error listing creations' });
  }
};
