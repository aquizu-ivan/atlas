import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, unauthenticated } from "../errors/httpErrors.js";
import { parseDateParts } from "../utils/availability.js";

const router = express.Router();

function readAdminToken(req) {
  const header = req.headers.authorization || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const alt = req.headers["x-admin-token"];
  if (typeof alt === "string") {
    return alt.trim();
  }
  return "";
}

function requireAdmin(req) {
  if (!env.adminAccessToken) {
    throw unauthenticated("Acceso restringido.");
  }
  const token = readAdminToken(req);
  if (!token || token !== env.adminAccessToken) {
    throw unauthenticated("Acceso restringido.");
  }
}

router.get("/admin/agenda", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const { date } = req.query || {};
  if (!date) {
    return next(badRequest("Missing required query params", { required: ["date"] }));
  }

  const parsed = parseDateParts(String(date));
  if (!parsed) {
    return next(badRequest("Invalid date", { date }));
  }

  try {
    requireAdmin(req);
    const startMs = Date.UTC(parsed.year, parsed.month - 1, parsed.day, 0, 0, 0, 0);
    const endMs = startMs + 24 * 60 * 60 * 1000;
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: {
          gte: new Date(startMs),
          lt: new Date(endMs),
        },
      },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        startAt: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        date: String(date),
        bookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/users", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  try {
    requireAdmin(req);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as adminRouter };
