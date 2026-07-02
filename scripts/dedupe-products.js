require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Finding duplicate products...');
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' } // Newest first
  });

  const seen = new Set();
  let duplicateIds = [];

  for (const product of products) {
    const key = product.name;
    if (seen.has(key)) {
      duplicateIds.push(product.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate products.`);
  
  if (duplicateIds.length > 0) {
    // Soft delete duplicates
    const res = await prisma.product.updateMany({
      where: { id: { in: duplicateIds } },
      data: { isDeleted: true }
    });
    console.log(`Soft deleted ${res.count} duplicate products.`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
