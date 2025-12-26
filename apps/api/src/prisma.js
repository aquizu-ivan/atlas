import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const prisma = env.databaseUrl ? new PrismaClient() : null;

export { prisma };
