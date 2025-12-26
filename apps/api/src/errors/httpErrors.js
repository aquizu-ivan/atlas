import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";

export function badRequest(message, details = null) {
  return new AppError(400, ERROR_CODES.BAD_REQUEST, message || "Bad request", details);
}

export function unauthenticated(message, details = null) {
  return new AppError(401, ERROR_CODES.UNAUTHENTICATED, message || "Unauthenticated", details);
}

export function forbidden(message, details = null) {
  return new AppError(403, ERROR_CODES.FORBIDDEN, message || "Forbidden", details);
}

export function notFound(message, details = null) {
  return new AppError(404, ERROR_CODES.NOT_FOUND, message || "Not found", details);
}

export function conflict(code, message, details = null) {
  const finalCode = code || ERROR_CODES.BOOKING_CONFLICT;
  return new AppError(409, finalCode, message || "Conflict", details);
}

export function internal(message, details = null) {
  return new AppError(500, ERROR_CODES.INTERNAL_ERROR, message || "Unexpected error", details);
}
