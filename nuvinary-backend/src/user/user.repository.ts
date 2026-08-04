import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@shared/api-utils.js';
import { METADATA_SK, userPk } from '@shared/db-keys.js';
import { User, UserUpdateDto } from './user.model.js';

/** Fetches the user's profile/metadata item. */
export async function getUser(userId: string): Promise<User | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: METADATA_SK },
    }),
  );
  return result.Item as User | undefined;
}

/** Creates the initial user profile item. */
export async function createUser(user: User): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: user,
    }),
  );
}

/** Overwrites the user's editable profile fields. */
export async function updateUser(userId: string, patch: UserUpdateDto): Promise<User> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { PK: userPk(userId), SK: METADATA_SK },
      UpdateExpression:
        'SET firstName = :f, lastName = :l, displayName = :d, avatarColor = :c',
      ExpressionAttributeValues: {
        ':f': patch.firstName,
        ':l': patch.lastName,
        ':d': patch.displayName,
        ':c': patch.avatarColor,
      },
      ReturnValues: 'ALL_NEW',
    }),
  );
  return result.Attributes as User;
}

/** Atomically decrements credits by 1, guarded against going below 0. */
export async function decrementCredits(userId: string, currentCredits: number): Promise<number> {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { PK: userPk(userId), SK: METADATA_SK },
        UpdateExpression: 'SET credits = credits - :one',
        ConditionExpression: 'credits > :zero',
        ExpressionAttributeValues: { ':one': 1, ':zero': 0 },
        ReturnValues: 'UPDATED_NEW',
      }),
    );
    return result.Attributes?.credits ?? currentCredits - 1;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return 0;
    }
    throw err;
  }
}
