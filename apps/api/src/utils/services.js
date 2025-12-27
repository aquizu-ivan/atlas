const FALLBACK_SERVICES = [
  { id: "svc_basic", name: "Consulta Basica", durationMin: 30 },
  { id: "svc_focus", name: "Sesion Focus", durationMin: 45 },
  { id: "svc_premium", name: "Sesion Premium", durationMin: 60 },
];

export function getFallbackServices() {
  return FALLBACK_SERVICES.map((service) => ({ ...service }));
}

export function findFallbackService(serviceId) {
  return FALLBACK_SERVICES.find((service) => service.id === serviceId) || null;
}

export async function ensureFallbackServices(prisma) {
  if (!prisma) {
    return getFallbackServices();
  }
  const count = await prisma.service.count();
  if (count > 0) {
    return null;
  }
  await prisma.$transaction(
    FALLBACK_SERVICES.map((service) =>
      prisma.service.upsert({
        where: { id: service.id },
        update: {
          name: service.name,
          durationMinutes: service.durationMin,
          isActive: true,
        },
        create: {
          id: service.id,
          name: service.name,
          durationMinutes: service.durationMin,
          isActive: true,
        },
      })
    )
  );
  return getFallbackServices();
}

export async function ensureFallbackService(prisma, serviceId) {
  const fallback = findFallbackService(serviceId);
  if (!prisma || !fallback) {
    return null;
  }
  const service = await prisma.service.upsert({
    where: { id: fallback.id },
    update: {
      name: fallback.name,
      durationMinutes: fallback.durationMin,
      isActive: true,
    },
    create: {
      id: fallback.id,
      name: fallback.name,
      durationMinutes: fallback.durationMin,
      isActive: true,
    },
  });
  return {
    id: service.id,
    name: service.name,
    durationMin: service.durationMinutes,
  };
}
