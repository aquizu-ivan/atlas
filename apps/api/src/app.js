import express from "express";
import cors from "cors";
import { healthHandler } from "./health.js";
import { errorHandler } from "./errors/errorHandler.js";
import { notFound } from "./errors/httpErrors.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", healthHandler);

app.use((req, res, next) => {
  next(notFound("Not found"));
});

app.use(errorHandler);

export { app };
