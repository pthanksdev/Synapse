import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL database connected successfully via Prisma");
  } catch (error) {
    console.warn("PostgreSQL connection notice:", error.message);
  }
}
