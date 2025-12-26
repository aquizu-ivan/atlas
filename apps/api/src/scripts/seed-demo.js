import { prisma } from "../prisma.js";

async function main() {
  if (!prisma) {
    console.error("Database not configured");
    process.exit(1);
  }

  let service = await prisma.service.findFirst({
    where: { name: "Demo Service" },
    select: { id: true },
  });

  if (!service) {
    service = await prisma.service.create({
      data: { name: "Demo Service", durationMinutes: 30, isActive: true },
      select: { id: true },
    });
  }

  const date = new Date(Date.now() + 60000);
  date.setMilliseconds(0);
  const startAt = date.toISOString();

  console.log(`serviceId=${service.id}`);
  console.log(`startAt=${startAt}`);
  console.log("QA:");
  console.log("1) POST /api/auth/request-link con email valido (dev).");
  console.log("2) Abrir el devLink de /api/auth/consume y capturar la cookie atlas_session.");
  console.log("3) POST /api/bookings con serviceId y startAt usando la cookie.");
  console.log("4) set ATLAS_SESSION=TOKEN_AQUI y ejecutar: pnpm -C apps/api run qa:concurrency");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
