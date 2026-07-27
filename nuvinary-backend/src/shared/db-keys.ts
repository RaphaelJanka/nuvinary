/** Entity prefixes used to build DynamoDB partition/sort keys, kept in one place to avoid typos at call sites. */
export const KeyPrefix = {
  User: 'USER',
  Creation: 'CREATION',
} as const;

export const METADATA_SK = 'METADATA';

/** SK prefix for a `begins_with` query across a user's creations. */
export const CREATION_SK_PREFIX = `${KeyPrefix.Creation}#`;

/** Constant GSI1PK value shared by every public creation, so they all land in one queryable partition. */
export const COMMUNITY_GSI1PK = 'PUBLIC';

export function userPk(userId: string): string {
  return `${KeyPrefix.User}#${userId}`;
}

export function creationSk(creationId: string): string {
  return `${CREATION_SK_PREFIX}${creationId}`;
}
