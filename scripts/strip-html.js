require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function stripHtml(html) {
  if (!html) return html;
  return html
    .replace(/<[^>]*>?/gm, ' ') // Replace all tags with a space
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')       // Condense multiple spaces into one
    .trim();
}

async function main() {
  console.log('Fetching products in batches...');
  let updatedCount = 0;
  let skip = 0;
  const take = 100;

  while (true) {
    const products = await prisma.product.findMany({
      where: { description: { not: null } },
      skip,
      take
    });

    if (products.length === 0) break;

    for (const product of products) {
      if (!product.description) continue;
      
      const cleaned = stripHtml(product.description);
      
      if (cleaned !== product.description) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description: cleaned }
        });
        updatedCount++;
      }
    }
    
    skip += take;
    console.log(`Processed ${skip} products...`);
  }

  console.log(`Cleaned HTML tags from ${updatedCount} product descriptions.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
