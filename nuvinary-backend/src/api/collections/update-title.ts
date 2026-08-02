import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createResponse, docClient, withErrorHandling } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { CollectionTitleDto } from '../../models/collection.model.js';
import { Errors } from '@shared/errors.js';

/** Updates a collection's title. */
export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw Errors.missingUserId;
  }

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    throw Errors.missingCollectionId;
  }

  const body = JSON.parse(event.body || '{}') as CollectionTitleDto;
  if (!body.title?.trim()) {
    throw Errors.titleRequired;
  }

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: userPk(userId),
          SK: collectionSk(collectionId),
        },
        UpdateExpression: 'SET title = :t',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: {
          ':t': body.title,
        },
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw Errors.collectionNotFound;
    }
    throw err;
  }

  return createResponse(200, { message: 'Collection title successfully updated' });
});
