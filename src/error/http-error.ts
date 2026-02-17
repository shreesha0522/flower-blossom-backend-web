export class HttpError extends Error {
  status: number;
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.status = statusCode;
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}