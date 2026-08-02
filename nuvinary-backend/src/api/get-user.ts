import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { METADATA_SK, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const user = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: userPk(userId),
        SK: METADATA_SK,
      },
    }),
  );

  if (!user.Item) {
    throw Errors.userNotFound;
  }

  return createResponse(200, user.Item);
});
