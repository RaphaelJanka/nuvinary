import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient } from '@shared/api-utils.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { create } from 'node:domain';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  try {
    const user = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `METADATA`,
        },
      }),
    );
    return createResponse(200, user.Item);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return createResponse(500, { message: 'Error fetching user profile' });
  }
};
