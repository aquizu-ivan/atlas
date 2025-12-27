import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, conflict, notFound, unauthenticated } from "../errors/httpErrors.js";
import { getSessionToken, readSession } from "../auth/session.js";
import { ensureFallbackService } from "../utils/services.js";
import {
  buildSlots,
  datePartsFromIso,
  formatDateParts,
  slotMatches,
} from "../utils/availability.js";

const router = express.Router();

async function requireSession(prismaClient, req) {
  const token = getSessionToken(req, env);
  if (!token) {
    throw unauthenticated("Necesitas iniciar sesion.");
  }
  const session = await readSession(prismaClient, token);
  if (!session) {
    throw unauthenticated("Necesitas iniciar sesion.");
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
      select: { durationMinutes: true, id: true },
    });
    let resolvedService = service;
    if (!resolvedService) {
      resolvedService = await ensureFallbackService(prisma, serviceId);
    }
    if (!resolvedService) {
      return next(notFound("Service not found", { serviceId }));
    }

    const dateParts = datePartsFromIso(startDate);
    if (!dateParts) {
      return next(badRequest("Invalid startAt", { startAt }));
    }
    const slots = buildSlots(dateParts);
    if (!slotMatches(startDate, slots)) {
      return next(badRequest("StartAt outside availability", {
        serviceId,
        date: formatDateParts(dateParts),
        startAt,
      }));
    }

    const endAt = new Date(startDate.getTime() + resolvedService.durationMinutes * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        userId: session.userId,
        serviceId,
        startAt: startDate,
        endAt,
      },
      select: {
        id: true,
        serviceId: true,
        status: true,
        startAt: true,
        createdAt: true,
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
      return next(conflict(
        ERROR_CODES.BOOKING_CONFLICT,
        "Ese horario ya no esta disponible.",
        { serviceId, startAt },
      ));
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
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        serviceId: true,
        status: true,
        startAt: true,
        endAt: true,
        createdAt: true,
        updatedAt: true,
        service: {
          select: {
            name: true,
            durationMinutes: true,
          },
        },
      },
    });

    const formatted = bookings.map((booking) => ({
      ...booking,
      canceledAt: booking.status === "CANCELED" ? booking.updatedAt : null,
    }));

    return res.status(200).json({
      ok: true,
      data: {
        bookings: formatted,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const bookingId = req.params?.id;
  if (!bookingId) {
    return next(badRequest("Missing booking id"));
  }

  try {
    const session = await requireSession(prisma, req);
    const existing = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.userId,
      },
      select: {
        id: true,
        serviceId: true,
        status: true,
        startAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existing) {
      return next(notFound("Booking not found", { bookingId }));
    }

    if (existing.status === "CANCELED") {
      return res.status(200).json({
        ok: true,
        data: {
          booking: {
            ...existing,
            canceledAt: existing.updatedAt,
          },
        },
      });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELED" },
      select: {
        id: true,
        serviceId: true,
        status: true,
        startAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        booking: {
          ...updated,
          canceledAt: updated.updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as bookingsRouter };
