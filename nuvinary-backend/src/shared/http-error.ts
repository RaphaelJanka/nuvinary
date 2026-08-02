/** An error carrying the HTTP status code and user-facing message it should produce. */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
