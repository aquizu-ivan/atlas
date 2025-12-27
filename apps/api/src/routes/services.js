import express from "express";
import { prisma } from "../prisma.js";
import { badRequest, notFound } from "../errors/httpErrors.js";
import { buildSlots, parseDateParts } from "../utils/availability.js";
import { ensureFallbackServices, findFallbackService, getFallbackServices } from "../utils/services.js";

const router = express.Router();

async function getServiceCatalog() {
  if (!prisma) {
    return getFallbackServices();
  }
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
    },
  });
  if (!services.length) {
    await ensureFallbackServices(prisma);
    return getFallbackServices();
  }
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    durationMin: service.durationMinutes,
  }));
}

async function findService(serviceId) {
  if (prisma) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, durationMinutes: true },
    });
    if (service) {
      return {
        id: service.id,
        name: service.name,
        durationMin: service.durationMinutes,
      };
    }
  }
  return findFallbackService(serviceId);
}

router.get("/services", async (req, res, next) => {
  try {
    const services = await getServiceCatalog();
    return res.status(200).json({
      ok: true,
      data: {
        services,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/availability", async (req, res, next) => {
  const { serviceId, date } = req.query || {};
  if (!serviceId || !date) {
    return next(badRequest("Missing required query params", { required: ["serviceId", "date"] }));
  }

  const parsedDate = parseDateParts(date);
  if (!parsedDate) {
    return next(badRequest("Invalid date", { date }));
  }

  try {
    const service = await findService(String(serviceId));
    if (!service) {
      return next(notFound("Service not found", { serviceId }));
    }

    const slots = buildSlots(parsedDate);
    return res.status(200).json({
      ok: true,
      data: {
        serviceId: service.id,
        date: String(date),
        slots,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export { router as servicesRouter };
