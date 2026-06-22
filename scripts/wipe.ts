import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Wiping database...');
  await prisma.jobItem.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database wiped.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
