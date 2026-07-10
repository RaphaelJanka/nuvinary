import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const commonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: commonHeaders,
    body: JSON.stringify(body),
  };
};
