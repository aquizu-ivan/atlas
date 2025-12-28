import dotenv from "dotenv";
import { normalizeBaseUrl } from "./utils/url.js";

dotenv.config();

const allowed = new Set(["development", "test", "production"]);
const rawNodeEnv = process.env.NODE_ENV;
const nodeEnv = allowed.has(rawNodeEnv) ? rawNodeEnv : "unknown";
const parsedPort = Number.parseInt(process.env.PORT ?? "", 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 4000;
const databaseUrl = process.env.DATABASE_URL || "";
const parsedTtl = Number.parseInt(process.env.AUTH_TOKEN_TTL_MINUTES ?? "", 10);
const authTokenTtlMinutes = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : 15;
const rawAuthDevLinks = process.env.AUTH_DEV_LINKS;
const authDevLinks = rawAuthDevLinks === undefined || rawAuthDevLinks === ""
  ? nodeEnv === "development" || nodeEnv === "test"
  : ["1", "true", "yes"].includes(String(rawAuthDevLinks).toLowerCase());
const rawPublicBaseUrl = process.env.PUBLIC_BASE_URL;
const defaultPublicBaseUrl = nodeEnv === "production" ? "" : "http://localhost:4000";
const publicBaseUrl = normalizeBaseUrl(rawPublicBaseUrl || defaultPublicBaseUrl);
const rawRedirectBaseUrl = process.env.AUTH_REDIRECT_BASE_URL;
const defaultRedirectBaseUrl = nodeEnv === "production" ? "" : "http://localhost:5173";
const authRedirectBaseUrl = normalizeBaseUrl(rawRedirectBaseUrl || defaultRedirectBaseUrl);
const parsedSessionDays = Number.parseInt(process.env.AUTH_SESSION_TTL_DAYS ?? "", 10);
const authSessionTtlDays = Number.isFinite(parsedSessionDays) && parsedSessionDays > 0 ? parsedSessionDays : 7;
const corsOrigin = process.env.CORS_ORIGIN || "";
const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN || "";
const startedAt = new Date().toISOString();

export const env = {
  nodeEnv,
  port,
  apiBase: "/api",
  webBaseUrl: authRedirectBaseUrl || null,
  databaseUrl,
  authTokenTtlMinutes,
  authDevLinks,
  publicBaseUrl,
  authRedirectBaseUrl,
  authSessionTtlDays,
  corsOrigin,
  adminAccessToken,
  startedAt,
};
