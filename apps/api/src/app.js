import express from "express";
import cors from "cors";
import { healthHandler } from "./health.js";
import { AppError } from "./errors/AppError.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", healthHandler);

app.use((req, res, next) => {
  next(new AppError(404, "NOT_FOUND", "Not found", null));
});

app.use(errorHandler);

export { app };
