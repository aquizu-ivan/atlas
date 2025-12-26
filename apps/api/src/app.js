import express from "express";
import cors from "cors";
import { healthHandler } from "./health.js";
import { env } from "./env.js";
import { errorHandler } from "./errors/errorHandler.js";
import { notFound } from "./errors/httpErrors.js";
import { bookingsRouter } from "./routes/bookings.js";
import { authRouter } from "./routes/auth.js";

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

const rawCorsOrigin = env.corsOrigin.trim();
const defaultOrigins = [
  "https://aquizu-ivan.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
];
const allowedOrigins = rawCorsOrigin
  ? rawCorsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use((req, res, next) => {
  const existing = res.getHeader("Vary");
  if (!existing) {
    res.setHeader("Vary", "Origin");
  } else if (!String(existing).toLowerCase().includes("origin")) {
    res.setHeader("Vary", `${existing}, Origin`);
  }
  next();
});
app.use(express.json());

app.get("/api/health", healthHandler);
app.use("/api/bookings", bookingsRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  next(notFound("Not found"));
});

app.use(errorHandler);

export { app };
