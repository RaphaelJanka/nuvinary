import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient } from '@shared/api-utils.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreationUpdateDto } from '../models/creation.model.js';

/** Updates a creation's title or visibility, whichever is present in the body. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;

  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    return createResponse(400, { message: 'Missing creation id' });
  }

  try {
    const body = JSON.parse(event.body || '{}') as CreationUpdateDto;
    if (body.title === undefined && body.isPublic === undefined) {
      return createResponse(400, { message: 'Missing required fields' });
    }

    const key = { PK: `USER#${userId}`, SK: `CREATION#${creationId}` };

    if (body.title !== undefined) {
      await docClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: key,
          UpdateExpression: 'SET title = :t',
          ExpressionAttributeValues: { ':t': body.title },
        }),
      );
      return createResponse(200, { message: 'Title successfully changed' });
    } else if (body.isPublic !== undefined) {
      await docClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: key,
          UpdateExpression: 'SET isPublic = :p',
          ExpressionAttributeValues: { ':p': body.isPublic },
        }),
      );
      return createResponse(200, {
        message: 'Visibility successfully changed',
      });
    }
    return createResponse(400, { message: 'Missing required fields' });
  } catch (err) {
    console.error('Error updating creation:', err);
    return createResponse(500, { message: 'Internal server error' });
  }
};
