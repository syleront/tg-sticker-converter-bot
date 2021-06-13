export class RequestError extends Error {
  constructor(statusCode) {
    super(`Request error, status code: ${statusCode}`);
  }
}