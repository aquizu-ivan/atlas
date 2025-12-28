import express from "express";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { badRequest, conflict, notFound, unauthenticated } from "../errors/httpErrors.js";
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

function normalizeName(value) {
  return String(value || "").trim();
}

function parseDuration(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 10 || parsed > 240) {
    return null;
  }
  return parsed;
}

function parseIsActive(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }
  return null;
}

async function ensureUniqueName(name, excludeId) {
  const existing = await prisma.service.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw conflict(ERROR_CODES.BAD_REQUEST, "Service already exists", { name });
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

router.patch("/admin/bookings/:id/confirm", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const bookingId = req.params?.id;
  if (!bookingId) {
    return next(badRequest("Missing booking id"));
  }

  try {
    requireAdmin(req);
    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, startAt: true, updatedAt: true },
    });
    if (!existing) {
      return next(notFound("Booking not found", { bookingId }));
    }
    if (existing.status === "CANCELED") {
      return next(conflict(ERROR_CODES.BAD_REQUEST, "La reserva ya fue cancelada."));
    }
    if (existing.status === "CONFIRMED") {
      return res.status(200).json({
        ok: true,
        data: {
          booking: existing,
        },
      });
    }
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
      select: { id: true, status: true, startAt: true, updatedAt: true },
    });
    return res.status(200).json({
      ok: true,
      data: {
        booking: updated,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/admin/bookings/:id/cancel", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const bookingId = req.params?.id;
  if (!bookingId) {
    return next(badRequest("Missing booking id"));
  }

  try {
    requireAdmin(req);
    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, startAt: true, updatedAt: true },
    });
    if (!existing) {
      return next(notFound("Booking not found", { bookingId }));
    }
    if (existing.status === "CANCELED") {
      return res.status(200).json({
        ok: true,
        data: {
          booking: existing,
        },
      });
    }
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELED" },
      select: { id: true, status: true, startAt: true, updatedAt: true },
    });
    return res.status(200).json({
      ok: true,
      data: {
        booking: updated,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin/services", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  try {
    requireAdmin(req);
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        services: services.map((service) => ({
          id: service.id,
          name: service.name,
          durationMin: service.durationMinutes,
          isActive: service.isActive,
          createdAt: service.createdAt,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/services", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const rawName = req.body?.name;
  const rawDuration = req.body?.durationMin;
  const rawIsActive = req.body?.isActive;
  const name = normalizeName(rawName);
  const durationMin = parseDuration(rawDuration);
  const isActive = parseIsActive(rawIsActive);

  if (!name || name.length < 2 || name.length > 60) {
    return next(badRequest("Invalid name", { name: rawName }));
  }
  if (!durationMin) {
    return next(badRequest("Invalid durationMin", { durationMin: rawDuration }));
  }
  if (isActive === null) {
    return next(badRequest("Invalid isActive", { isActive: rawIsActive }));
  }

  try {
    requireAdmin(req);
    await ensureUniqueName(name);
    const service = await prisma.service.create({
      data: {
        name,
        durationMinutes: durationMin,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      ok: true,
      data: {
        service: {
          id: service.id,
          name: service.name,
          durationMin: service.durationMinutes,
          isActive: service.isActive,
          createdAt: service.createdAt,
        },
      },
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      return next(conflict(ERROR_CODES.BAD_REQUEST, "Service already exists", { name }));
    }
    return next(error);
  }
});

router.patch("/admin/services/:id", async (req, res, next) => {
  if (!prisma) {
    return next(new AppError(503, ERROR_CODES.INTERNAL_ERROR, "Database not configured", { configured: false }));
  }

  const serviceId = req.params?.id;
  if (!serviceId) {
    return next(badRequest("Missing service id"));
  }

  const rawName = req.body?.name;
  const rawDuration = req.body?.durationMin;
  const rawIsActive = req.body?.isActive;
  const name = rawName !== undefined ? normalizeName(rawName) : "";
  const durationMin = rawDuration !== undefined ? parseDuration(rawDuration) : undefined;
  const isActive = parseIsActive(rawIsActive);

  if (rawName !== undefined && (!name || name.length < 2 || name.length > 60)) {
    return next(badRequest("Invalid name", { name: rawName }));
  }
  if (rawDuration !== undefined && !durationMin) {
    return next(badRequest("Invalid durationMin", { durationMin: rawDuration }));
  }
  if (rawIsActive !== undefined && isActive === null) {
    return next(badRequest("Invalid isActive", { isActive: rawIsActive }));
  }

  const data = {};
  if (rawName !== undefined) {
    data.name = name;
  }
  if (rawDuration !== undefined) {
    data.durationMinutes = durationMin;
  }
  if (rawIsActive !== undefined) {
    data.isActive = isActive;
  }

  if (!Object.keys(data).length) {
    return next(badRequest("Missing fields to update"));
  }

  try {
    requireAdmin(req);
    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true },
    });
    if (!existing) {
      return next(notFound("Service not found", { serviceId }));
    }
    if (data.name && data.name !== existing.name) {
      await ensureUniqueName(data.name, serviceId);
    }
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        service: {
          id: updated.id,
          name: updated.name,
          durationMin: updated.durationMinutes,
          isActive: updated.isActive,
          createdAt: updated.createdAt,
        },
      },
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      return next(conflict(ERROR_CODES.BAD_REQUEST, "Service already exists", { name: data.name }));
    }
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
