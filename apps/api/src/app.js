import express from "express";
import cors from "cors";
import { healthHandler } from "./health.js";
import { errorHandler } from "./errors/errorHandler.js";
import { notFound } from "./errors/httpErrors.js";
import { bookingsRouter } from "./routes/bookings.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", healthHandler);
app.use("/api/bookings", bookingsRouter);

app.use((req, res, next) => {
  next(notFound("Not found"));
});

app.use(errorHandler);

export { app };
