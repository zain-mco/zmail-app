import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create a connection pool
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create or reuse the connection pool
    const pool = globalForPrisma.pool ?? new Pool({ connectionString });
    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.pool = pool;
    }

    // Create Prisma adapter for pg
    const adapter = new PrismaPg(pool);

    // Create PrismaClient with the adapter
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
