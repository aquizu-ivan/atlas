import { env } from "./env.js";

export function healthHandler(req, res) {
  const urlPresent = Boolean(env.databaseUrl);

  res.status(200).json({
    ok: true,
    service: "atlas-api",
    env: env.nodeEnv,
    gitSha: "dev",
    startedAt: env.startedAt,
    uptimeSec: Math.floor(process.uptime()),
    expected: {
      apiBase: env.apiBase,
      webBaseUrl: env.webBaseUrl || null,
    },
    db: {
      configured: urlPresent,
      provider: "postgresql",
      urlPresent,
    },
  });
}
