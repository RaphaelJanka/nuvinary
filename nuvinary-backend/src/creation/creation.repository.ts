import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@shared/api-utils.js';
import { COMMUNITY_GSI1PK, CREATION_SK_PREFIX, creationSk, userPk } from '@shared/db-keys.js';
import { getPresignedImageUrl } from '@shared/s3-utils.js';
import { CreationItem, CreationResponse } from './creation.model.js';

/** Fetches a single creation belonging to the given user. */
export async function getCreation(userId: string, creationId: string): Promise<CreationItem | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
    }),
  );
  return result.Item as CreationItem | undefined;
}

/** Writes a newly generated creation item. */
export async function saveCreation(item: CreationItem): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    }),
  );
}

/** Deletes a creation and returns its former attributes, or undefined if it didn't exist. */
export async function deleteCreation(userId: string, creationId: string): Promise<CreationItem | undefined> {
  const result = await docClient.send(
    new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
      ReturnValues: 'ALL_OLD',
    }),
  );
  return result.Attributes as CreationItem | undefined;
}

/** Lists all of a user's creations. */
export async function listUserCreations(userId: string): Promise<CreationItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: { ':pk': userPk(userId), ':skPrefix': CREATION_SK_PREFIX },
    }),
  );
  return (result.Items ?? []) as CreationItem[];
}

/** Lists all public creations across all users, newest first. */
export async function listCommunityCreations(): Promise<CreationItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'CreationIndex',
      KeyConditionExpression: 'GSI1PK = :gpk',
      ExpressionAttributeValues: { ':gpk': COMMUNITY_GSI1PK },
      ScanIndexForward: false,
    }),
  );
  return (result.Items ?? []) as CreationItem[];
}

/** Updates a creation's title. */
export async function updateCreationTitle(userId: string, creationId: string, title: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
      UpdateExpression: 'SET title = :t',
      ExpressionAttributeValues: { ':t': title },
    }),
  );
}

/** Marks a creation public and adds it to the community GSI. */
export async function setCreationPublic(userId: string, creationId: string, isPublic: boolean): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
      UpdateExpression: 'SET isPublic = :p, GSI1PK = :gpk, GSI1SK = createdAt',
      ExpressionAttributeValues: { ':p': isPublic, ':gpk': COMMUNITY_GSI1PK },
    }),
  );
}

/** Marks a creation private and removes it from the community GSI. */
export async function setCreationPrivate(userId: string, creationId: string, isPublic: boolean): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: creationSk(creationId) },
      UpdateExpression: 'SET isPublic = :p REMOVE GSI1PK, GSI1SK',
      ExpressionAttributeValues: { ':p': isPublic },
    }),
  );
}

/** Maps a stored creation item to its API response shape, resolving a fresh presigned image URL. */
export async function toCreationResponse(item: CreationItem): Promise<CreationResponse> {
  return {
    id: item.id,
    title: item.title,
    url: await getPresignedImageUrl(item.imageKey),
    createdAt: item.createdAt,
    isPublic: item.isPublic,
    createdBy: item.createdBy,
    aiMetadata: item.aiMetadata,
  };
}
