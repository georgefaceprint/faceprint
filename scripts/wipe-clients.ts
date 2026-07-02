import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Wiping all clients to prep for clean import...');
  const result = await prisma.client.deleteMany({});
  console.log(`Deleted ${result.count} clients.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
