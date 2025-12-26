import { prisma } from "../prisma.js";

async function main() {
  if (!prisma) {
    console.error("Database not configured");
    process.exit(1);
  }

  const email = "demo@atlas.local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true },
  });

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

  console.log(JSON.stringify({ userId: user.id, serviceId: service.id }));
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
