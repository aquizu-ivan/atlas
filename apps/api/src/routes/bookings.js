import cookie from "cookie";
import express from "express";
import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, conflict, unauthenticated } from "../errors/httpErrors.js";
import { readSession, SESSION_COOKIE_NAME } from "../auth/session.js";

const router = express.Router();

async function requireSession(prismaClient, req) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    throw unauthenticated("Necesitas iniciar sesión.");
  }
  const session = await readSession(prismaClient, token);
  if (!session) {
    throw unauthenticated("Necesitas iniciar sesión.");
  }
  return {
    userId: session.userId,
    userEmail: session.user.email,
    userStatus: session.user.status,
  };
}

router.post("/", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const { serviceId, startAt } = req.body || {};
  if (!serviceId || !startAt) {
    return next(badRequest("Missing required fields", { required: ["serviceId", "startAt"] }));
  }

  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) {
    return next(badRequest("Invalid startAt", { startAt }));
  }

  try {
    const session = await requireSession(prisma, req);
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true },
    });
    if (!service) {
      return next(badRequest("Service not found", { serviceId }));
    }

    const endAt = new Date(startDate.getTime() + service.durationMinutes * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        userId: session.userId,
        serviceId,
        startAt: startDate,
        endAt,
      },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
      },
    });

    return res.status(201).json({
      ok: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      return next(conflict(ERROR_CODES.BOOKING_CONFLICT, "Ese horario ya no está disponible.", { serviceId, startAt }));
    }
    return next(error);
  }
});

router.get("/me", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  try {
    const session = await requireSession(prisma, req);
    const bookings = await prisma.booking.findMany({
      where: { userId: session.userId },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
        service: {
          select: {
            name: true,
            durationMinutes: true,
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as bookingsRouter };
