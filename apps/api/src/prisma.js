import prismaPkg from "@prisma/client";
import { env } from "./env.js";

const { PrismaClient } = prismaPkg;

const prisma = env.databaseUrl ? new PrismaClient() : null;

export { prisma };
