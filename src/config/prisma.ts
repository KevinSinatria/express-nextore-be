import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Singleton pattern
const globalForPrisma: any = global;

if (!globalForPrisma.prismaPool) {
  globalForPrisma.prismaPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
const pool = globalForPrisma.prismaPool;

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
