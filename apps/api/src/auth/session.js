import crypto from "node:crypto";
import cookie from "cookie";

const SESSION_COOKIE_NAME = "atlas_session";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildSessionCookieOptions(env, expiresAt) {
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const bases = [env.publicBaseUrl, env.authRedirectBaseUrl].filter(Boolean);
  const joined = bases.join(" ").toLowerCase();
  const isLocalhost = joined.includes("localhost") || joined.includes("127.0.0.1");
  const isHttps = bases.some((base) => base.toLowerCase().startsWith("https://"));
  const allowCrossSite = (env.nodeEnv === "production" || isHttps) && !isLocalhost;
  return {
    httpOnly: true,
    sameSite: allowCrossSite ? "none" : "lax",
    secure: allowCrossSite,
    path: "/",
    expires: expiresAt,
    maxAge: maxAgeSeconds,
  };
}

export async function createSession(prisma, userId, ttlDays) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
    select: { id: true },
  });

  return { token, expiresAt };
}

export async function readSession(prisma, token) {
  if (!token) {
    return null;
  }
  const tokenHash = hashToken(token);
  return prisma.session.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      userId: true,
      expiresAt: true,
      user: {
        select: {
          email: true,
          status: true,
        },
      },
    },
  });
}

export function getSessionToken(req, env) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const cookieToken = cookies[SESSION_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }
  if (!env?.authDevLinks) {
    return "";
  }
  const headerValue = req.headers.authorization || "";
  if (!headerValue.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return headerValue.slice(7).trim();
}

export async function clearSession(prisma, token) {
  if (!token) {
    return 0;
  }
  const tokenHash = hashToken(token);
  const result = await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

export { SESSION_COOKIE_NAME };
