import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, docClient } from '@shared/api-utils.js';
import { collectionSk, userPk } from '@shared/db-keys.js';
import {
  CollectionItem,
  CollectionResponse,
  CreateCollectionDto,
} from '../../models/collection.model.js';

/** Creates a new empty collection for the authenticated user. */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    return createResponse(401, { message: 'User ID not found' });
  }

  const body = JSON.parse(event.body || '{}') as CreateCollectionDto;
  if (!body.title?.trim()) {
    return createResponse(400, { message: 'Title is required' });
  }

  try {
    const collectionItem = buildCollectionItem(userId, body);
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: collectionItem,
      }),
    );

    const collection: CollectionResponse = {
      id: collectionItem.id,
      createdBy: collectionItem.createdBy,
      title: collectionItem.title,
      createdAt: collectionItem.createdAt,
      creations: collectionItem.creations,
    };
    return createResponse(200, collection);
  } catch (err) {
    console.error('Error creating collection:', err);
    return createResponse(500, { message: 'Error creating collection' });
  }
};

/** Assembles the DynamoDB item for a new collection. */
function buildCollectionItem(
  userId: string,
  body: CreateCollectionDto,
): CollectionItem {
  const id = randomUUID();
  return {
    PK: userPk(userId),
    SK: collectionSk(id),
    id,
    title: body.title,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    creations: [],
  };
}
