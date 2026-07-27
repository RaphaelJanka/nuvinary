import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserUpdateDto } from '../models/user.model.js';
import { createResponse, docClient } from '@shared/api-utils.js';
import { METADATA_SK, userPk } from '@shared/db-keys.js';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  const pathUid = event.pathParameters?.uid;

  if (!userId || userId !== pathUid) {
    return createResponse(403, { message: 'Unauthorized' });
  }

  try {
    const body = JSON.parse(event.body || '{}') as UserUpdateDto;
    if (
      !body.firstName ||
      !body.lastName ||
      !body.displayName ||
      !body.avatarColor
    ) {
      return createResponse(400, { message: 'Missing required fields' });
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: userPk(userId),
          SK: METADATA_SK,
        },
        UpdateExpression:
          'SET firstName = :f, lastName = :l, displayName = :d, avatarColor = :c',
        ExpressionAttributeValues: {
          ':f': body.firstName,
          ':l': body.lastName,
          ':d': body.displayName,
          ':c': body.avatarColor,
        },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return createResponse(200, result.Attributes);
  } catch (err) {
    console.error('Error updating user profile:', err);
    return createResponse(500, { message: 'Internal server error' });
  }
};
