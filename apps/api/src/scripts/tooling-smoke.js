import { execSync } from "node:child_process";
import prismaPkg from "@prisma/client";

function run(cmd) {
  const output = execSync(cmd, { encoding: "utf8" }).trim();
  console.log(output);
}

try {
  run("node -v");
  run("pnpm -v");
  run("pnpm exec -- prisma -v");

  const PrismaClient = prismaPkg?.PrismaClient || prismaPkg?.default?.PrismaClient;
  if (!PrismaClient) {
    throw new Error("PrismaClient export not found");
  }
  const client = new PrismaClient();
  await client.$disconnect();
  console.log("prisma client ok");
} catch (error) {
  console.error(error);
  process.exit(1);
}
