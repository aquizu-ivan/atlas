import { AppError } from "./AppError.js";

export function errorHandler(err, req, res, next) {
  const appError = err instanceof AppError
    ? err
    : new AppError(500, "INTERNAL_ERROR", "Unexpected error", null);
  const status = appError.status || 500;

  res.status(status).json({
    ok: false,
    error: {
      code: appError.code || "INTERNAL_ERROR",
      message: appError.message || "Unexpected error",
      details: appError.details ?? null,
      timestamp: new Date().toISOString(),
    },
  });
}
