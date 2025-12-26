import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";
import { env } from "../env.js";

export function errorHandler(err, req, res, next) {
  const appError = err instanceof AppError
    ? err
    : new AppError(500, ERROR_CODES.INTERNAL_ERROR, "Unexpected error", null);
  const status = appError.status || 500;

  if (env.nodeEnv === "development") {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    error: {
      code: appError.code || ERROR_CODES.INTERNAL_ERROR,
      message: appError.message || "Unexpected error",
      details: appError.details ?? null,
      timestamp: new Date().toISOString(),
    },
  });
}
