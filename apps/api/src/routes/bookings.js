import express from "express";
import { prisma } from "../prisma.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, conflict } from "../errors/httpErrors.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const { userId, serviceId, startAt } = req.body || {};
  if (!userId || !serviceId || !startAt) {
    return next(badRequest("Missing required fields", { required: ["userId", "serviceId", "startAt"] }));
  }

  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) {
    return next(badRequest("Invalid startAt", { startAt }));
  }

  try {
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
        userId,
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
      return next(conflict(ERROR_CODES.BOOKING_CONFLICT, "Booking conflict", { serviceId, startAt }));
    }
    return next(error);
  }
});

export { router as bookingsRouter };
