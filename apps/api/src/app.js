import express from "express";
import cors from "cors";
import { healthHandler } from "./health.js";
import { env } from "./env.js";
import { errorHandler } from "./errors/errorHandler.js";
import { notFound } from "./errors/httpErrors.js";
import { bookingsRouter } from "./routes/bookings.js";
import { authRouter } from "./routes/auth.js";

const app = express();

const rawCorsOrigin = env.corsOrigin.trim();
let allowedOrigins = [];

if (rawCorsOrigin) {
  allowedOrigins = rawCorsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);
} else if (env.nodeEnv === "development" || env.nodeEnv === "test") {
  allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
} else if (env.nodeEnv === "production") {
  throw new Error("CORS_ORIGIN is required in production");
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", healthHandler);
app.use("/api/bookings", bookingsRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  next(notFound("Not found"));
});

app.use(errorHandler);

export { app };
