import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CreationUpdateDto } from '../models/creation.model.js';
import { COMMUNITY_GSI1PK, creationSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';

/** Updates a creation's title or visibility, whichever is present in the body. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const creationId = event.pathParameters?.id;
  if (!creationId) {
    throw Errors.missingCreationId;
  }

  const body = JSON.parse(event.body || '{}') as CreationUpdateDto;
  if (body.title === undefined && body.isPublic === undefined) {
    throw Errors.missingFields;
  }

  const key = { PK: userPk(userId), SK: creationSk(creationId) };

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
  }

  if (body.isPublic) {
    await setCreationPublic(body, key);
  } else {
    await setCreationPrivate(body, key);
  }
  return createResponse(200, { message: 'Visibility successfully changed' });
});

/** Marks a creation public and adds it to the community GSI. */
async function setCreationPublic(
  body: CreationUpdateDto,
  key: { PK: string; SK: string },
) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET isPublic = :p, GSI1PK = :gpk, GSI1SK = createdAt',
      ExpressionAttributeValues: {
        ':p': body.isPublic,
        ':gpk': COMMUNITY_GSI1PK,
      },
    }),
  );
}

/** Marks a creation private and removes it from the community GSI. */
async function setCreationPrivate(
  body: CreationUpdateDto,
  key: { PK: string; SK: string },
) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET isPublic = :p REMOVE GSI1PK, GSI1SK',
      ExpressionAttributeValues: { ':p': body.isPublic },
    }),
  );
}
