import 'server-only';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pgPool: Pool;
};

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({ connectionString });
}

const pool = globalForPrisma.pgPool;
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
