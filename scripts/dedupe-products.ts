import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Finding duplicate products...');
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' } // Newest first
  });

  const seen = new Set();
  let duplicateIds = [];

  for (const product of products) {
    const key = `${product.name}-${product.sku}`;
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
  .finally(() => prisma.$disconnect());
