export class AppError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = "AppError";
    this.status = status || 500;
    this.code = code || "INTERNAL_ERROR";
    this.details = details ?? null;
  }
}
