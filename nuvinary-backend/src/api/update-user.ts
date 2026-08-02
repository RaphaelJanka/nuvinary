import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserUpdateDto } from '../models/user.model.js';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { METADATA_SK, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  const pathUid = event.pathParameters?.uid;
  if (!userId || userId !== pathUid) {
    throw Errors.forbidden;
  }

  const body = JSON.parse(event.body || '{}') as UserUpdateDto;
  if (!body.firstName || !body.lastName || !body.displayName || !body.avatarColor) {
    throw Errors.missingFields;
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
});
