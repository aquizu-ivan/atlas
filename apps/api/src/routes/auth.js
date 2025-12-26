import crypto from "node:crypto";
import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest } from "../errors/httpErrors.js";

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

export { router as authRouter };
