import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HttpError } from '@shared/http-error.js';

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

/** Wraps a handler so thrown `HttpError`s map to their response and every other error logs once and becomes a 500. */
export const withErrorHandling = (
  fn: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>,
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      return await fn(event);
    } catch (err) {
      console.error(err);
      if (err instanceof HttpError) {
        return createResponse(err.statusCode, { message: err.message });
      }
      return createResponse(500, { message: 'Internal server error' });
    }
  };
};
