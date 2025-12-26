import crypto from "node:crypto";
import cookie from "cookie";
import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, unauthenticated } from "../errors/httpErrors.js";
import {
  buildSessionCookieOptions,
  clearSession,
  createSession,
  readSession,
  SESSION_COOKIE_NAME,
} from "../auth/session.js";

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    const data = {
      message: "Te enviamos un link para entrar.",
    };
    if (env.authDevLinks) {
      data.devLink = `${env.publicBaseUrl}/api/auth/consume?token=${token}`;
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
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const rawToken = req.query?.token;
  const token = typeof rawToken === "string" ? rawToken : "";
  if (!token) {
    return next(badRequest("Invalid token", { token: rawToken }));
  }

  const invalidMessage = "El link expiró o es inválido.";

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const loginToken = await prisma.loginToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });

    if (!loginToken) {
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
      return next(unauthenticated(invalidMessage));
    }

    const session = await createSession(prisma, loginToken.userId, env.authSessionTtlDays);
    const cookieOptions = buildSessionCookieOptions(env, session.expiresAt);
    res.setHeader("Set-Cookie", cookie.serialize(SESSION_COOKIE_NAME, session.token, cookieOptions));

    return res.status(200).json({
      ok: true,
      data: {
        message: "Sesión activa.",
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

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return next(unauthenticated("Necesitas iniciar sesión."));
  }

  try {
    const session = await readSession(prisma, token);
    if (!session) {
      return next(unauthenticated("Necesitas iniciar sesión."));
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

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return next(unauthenticated("Necesitas iniciar sesión."));
  }

  try {
    const session = await readSession(prisma, token);
    if (!session) {
      return next(unauthenticated("Necesitas iniciar sesión."));
    }

    await clearSession(prisma, token);
    const cookieOptions = { ...buildSessionCookieOptions(env, new Date(0)), maxAge: 0 };
    res.setHeader("Set-Cookie", cookie.serialize(SESSION_COOKIE_NAME, "", cookieOptions));

    return res.status(200).json({
      ok: true,
      data: {
        message: "Sesión cerrada.",
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as authRouter };
