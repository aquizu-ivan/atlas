import dotenv from "dotenv";

dotenv.config();

const allowed = new Set(["development", "test", "production"]);
const rawNodeEnv = process.env.NODE_ENV;
const nodeEnv = allowed.has(rawNodeEnv) ? rawNodeEnv : "unknown";
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 4000;
const databaseUrl = process.env.DATABASE_URL || "";
const startedAt = new Date().toISOString();

export const env = {
  nodeEnv,
  port,
  apiBase: "/api",
  webBaseUrl: null,
  databaseUrl,
  startedAt,
};
