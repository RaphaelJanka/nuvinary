import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@shared/api-utils.js';
import { COLLECTION_SK_PREFIX, collectionSk, userPk } from '@shared/db-keys.js';
import { Errors } from '@shared/errors.js';
import { CollectionItem } from './collection.model.js';

/** Counts how many collections the user already has. */
export async function countCollections(userId: string): Promise<number> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: { ':pk': userPk(userId), ':skPrefix': COLLECTION_SK_PREFIX },
      Select: 'COUNT',
    }),
  );
  return result.Count ?? 0;
}

/** Writes a newly created collection item. */
export async function saveCollection(item: CollectionItem): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    }),
  );
}

/** Fetches a single collection belonging to the given user. */
export async function getCollection(userId: string, collectionId: string): Promise<CollectionItem | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
    }),
  );
  return result.Item as CollectionItem | undefined;
}

/** Lists the authenticated user's collections. */
export async function listCollections(userId: string): Promise<CollectionItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: { ':pk': userPk(userId), ':skPrefix': COLLECTION_SK_PREFIX },
    }),
  );
  return (result.Items ?? []) as CollectionItem[];
}

/** Deletes a collection and returns its former attributes, or undefined if it didn't exist. */
export async function deleteCollection(userId: string, collectionId: string): Promise<CollectionItem | undefined> {
  const result = await docClient.send(
    new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
      ReturnValues: 'ALL_OLD',
    }),
  );
  return result.Attributes as CollectionItem | undefined;
}

/** Updates a collection's title; throws collectionNotFound if it doesn't exist. */
export async function updateCollectionTitle(userId: string, collectionId: string, title: string): Promise<void> {
  await updateExistingCollection(userId, collectionId, {
    UpdateExpression: 'SET title = :t',
    ExpressionAttributeValues: { ':t': title },
  });
}

/** Appends a creation id to a collection's list; throws collectionNotFound if it doesn't exist. */
export async function addCreationToCollection(
  userId: string,
  collectionId: string,
  creationId: string,
): Promise<void> {
  await updateExistingCollection(userId, collectionId, {
    UpdateExpression: 'SET creationIds = list_append(creationIds, :newId)',
    ExpressionAttributeValues: { ':newId': [creationId] },
  });
}

/** Overwrites a collection's creation id list; throws collectionNotFound if it doesn't exist. */
export async function setCollectionCreationIds(
  userId: string,
  collectionId: string,
  creationIds: string[],
): Promise<void> {
  await updateExistingCollection(userId, collectionId, {
    UpdateExpression: 'SET creationIds = :ids',
    ExpressionAttributeValues: { ':ids': creationIds },
  });
}

/** Runs an UpdateCommand guarded by `attribute_exists(PK)`, translating a failed guard into collectionNotFound. */
async function updateExistingCollection(
  userId: string,
  collectionId: string,
  update: { UpdateExpression: string; ExpressionAttributeValues: Record<string, unknown> },
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: collectionSk(collectionId) },
        ConditionExpression: 'attribute_exists(PK)',
        ...update,
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw Errors.collectionNotFound;
    }
    throw err;
  }
}
