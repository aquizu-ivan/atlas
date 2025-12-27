import crypto from "node:crypto";
import cookie from "cookie";
import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, unauthenticated } from "../errors/httpErrors.js";
import { joinUrl, normalizeBaseUrl } from "../utils/url.js";
import {
  buildSessionCookieOptions,
  clearSession,
  createSession,
  getSessionToken,
  readSession,
  SESSION_COOKIE_NAME,
} from "../auth/session.js";

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function wantsHtml(req) {
  const accept = req.headers.accept || "";
  return accept.includes("text/html");
}

function resolvePublicBaseUrl(req) {
  if (env.publicBaseUrl) {
    return env.publicBaseUrl;
  }
  if (env.nodeEnv !== "production") {
    return env.publicBaseUrl;
  }
  const protocol = req.protocol;
  const host = req.get("host");
  if (protocol === "https" && host) {
    return normalizeBaseUrl(`${protocol}://${host}`);
  }
  return "";
}

function resolveRedirectBaseUrl() {
  return env.authRedirectBaseUrl || "";
}

function redirectUrl(status, devToken) {
  const base = resolveRedirectBaseUrl();
  if (!base) {
    return "";
  }
  if (devToken) {
    const baseWithSlash = joinUrl(base, "/");
    return `${baseWithSlash}#auth=${status}&devToken=${encodeURIComponent(devToken)}`;
  }
  return joinUrl(base, `/?auth=${status}`);
}

router.post("/request-link", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const rawEmail = req.body?.email;
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return next(badRequest("Invalid email", { email: rawEmail }));
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true },
    });

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + env.authTokenTtlMinutes * 60 * 1000);

    await prisma.loginToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });

    const publicBaseUrl = resolvePublicBaseUrl(req);
    if (!publicBaseUrl) {
      return next(new AppError(500, ERROR_CODES.INTERNAL_ERROR, "PUBLIC_BASE_URL is required in production"));
    }
    const consumeUrl = joinUrl(publicBaseUrl, "/api/auth/consume");
    const devLink = `${consumeUrl}?token=${token}`;
    const data = {
      message: "Te enviamos un link para entrar.",
    };

    if (env.authDevLinks) {
      data.devLink = devLink;
    }

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/consume", async (req, res, next) => {
  const html = wantsHtml(req);
  const redirectBase = resolveRedirectBaseUrl();
  if (html && env.nodeEnv === "production" && !redirectBase) {
    return next(new AppError(500, ERROR_CODES.INTERNAL_ERROR, "AUTH_REDIRECT_BASE_URL is required in production"));
  }
  if (!prisma) {
    if (html) {
      if (redirectBase) {
        return res.redirect(302, redirectUrl("error"));
      }
    }
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const rawToken = req.query?.token;
  const token = typeof rawToken === "string" ? rawToken : "";
  if (!token) {
    if (html) {
      if (redirectBase) {
        return res.redirect(302, redirectUrl("error"));
      }
    }
    return next(badRequest("Invalid token", { token: rawToken }));
  }

  const invalidMessage = "El link expiro o es invalido.";

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const loginToken = await prisma.loginToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });

    if (!loginToken) {
      if (html) {
        if (redirectBase) {
          return res.redirect(302, redirectUrl("error"));
        }
      }
      return next(unauthenticated(invalidMessage));
    }

    const now = new Date();
    const updated = await prisma.loginToken.updateMany({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (updated.count === 0) {
      if (html) {
        if (redirectBase) {
          return res.redirect(302, redirectUrl("error"));
        }
      }
      return next(unauthenticated(invalidMessage));
    }

    const session = await createSession(prisma, loginToken.userId, env.authSessionTtlDays);
    const cookieOptions = buildSessionCookieOptions(env, session.expiresAt);
    res.setHeader("Set-Cookie", cookie.serialize(SESSION_COOKIE_NAME, session.token, cookieOptions));

    if (html) {
      if (redirectBase) {
        if (env.authDevLinks) {
          return res.redirect(302, redirectUrl("success", session.token));
        }
        return res.redirect(302, redirectUrl("success"));
      }
    }

    return res.status(200).json({
      ok: true,
      data: {
        message: "Sesion activa.",
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/session", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const token = getSessionToken(req, env);
  if (!token) {
    return next(unauthenticated("Necesitas iniciar sesion."));
  }

  try {
    const session = await readSession(prisma, token);
    if (!session) {
      return next(unauthenticated("Necesitas iniciar sesion."));
    }

    return res.status(200).json({
      ok: true,
      data: {
        user: {
          email: session.user.email,
          status: session.user.status,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const token = getSessionToken(req, env);
  if (!token) {
    return next(unauthenticated("Necesitas iniciar sesion."));
  }

  try {
    const session = await readSession(prisma, token);
    if (!session) {
      return next(unauthenticated("Necesitas iniciar sesion."));
    }

    await clearSession(prisma, token);
    const cookieOptions = { ...buildSessionCookieOptions(env, new Date(0)), maxAge: 0 };
    res.setHeader("Set-Cookie", cookie.serialize(SESSION_COOKIE_NAME, "", cookieOptions));

    return res.status(200).json({
      ok: true,
      data: {
        message: "Sesion cerrada.",
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as authRouter };
