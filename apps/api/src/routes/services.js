import express from "express";
import { prisma } from "../prisma.js";
import { badRequest, notFound } from "../errors/httpErrors.js";

const router = express.Router();

const FALLBACK_SERVICES = [
  { id: "svc_basic", name: "Consulta Basica", durationMin: 30 },
  { id: "svc_focus", name: "Sesion Focus", durationMin: 45 },
  { id: "svc_premium", name: "Sesion Premium", durationMin: 60 },
];

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function buildSlots({ year, month, day }) {
  const startHour = 9;
  const endHour = 17;
  const intervalMinutes = 30;
  const startMs = Date.UTC(year, month - 1, day, startHour, 0, 0, 0);
  const totalMinutes = (endHour - startHour) * 60;
  const slots = [];
  for (let offset = 0; offset < totalMinutes; offset += intervalMinutes) {
    const date = new Date(startMs + offset * 60 * 1000);
    slots.push({ startAt: date.toISOString() });
  }
  return slots;
}

async function getServiceCatalog() {
  if (!prisma) {
    return FALLBACK_SERVICES;
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
    return FALLBACK_SERVICES;
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
  return FALLBACK_SERVICES.find((service) => service.id === serviceId) || null;
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

  const parsedDate = parseDate(date);
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
