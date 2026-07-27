import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import { CreateCollectionDto } from '../../models/collection.model.js';

/** Updates a collection's title. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;

  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const collectionId = event.pathParameters?.id;
  if (!collectionId) {
    return createResponse(400, { message: 'Missing collection id' });
  }

  const body = JSON.parse(event.body || '{}') as CreateCollectionDto;
  if (!body.title?.trim()) {
    return createResponse(400, { message: 'Title is required' });
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
    return createResponse(200, {
      message: 'Collection title successfully updated',
    });
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return createResponse(404, { message: 'Collection not found' });
    }
    console.error('Error updating collection title', err);
    return createResponse(500, { message: 'Error updating collection title' });
  }
};
