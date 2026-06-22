import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const xmlPath = path.join(process.cwd(), 'products.xml');
  if (!fs.existsSync(xmlPath)) {
    console.error('products.xml not found at', xmlPath);
    process.exit(1);
  }

  console.log('Reading XML file...');
  const xmlData = fs.readFileSync(xmlPath, 'utf8');

  console.log('Parsing XML (this might take a few seconds)...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
  });
  
  const parsed = parser.parse(xmlData);
  const items = parsed.rss?.channel?.item;

  if (!items) {
    console.error('No items found in the XML.');
    process.exit(1);
  }

  const products = Array.isArray(items) ? items : [items];
  const wpProducts = products.filter((item: any) => {
    const type = item['wp:post_type'];
    const typeStr = typeof type === 'object' && type.__cdata ? type.__cdata : type;
    return typeStr === 'product';
  });

  console.log(`Found ${wpProducts.length} WooCommerce products. Importing...`);

  let count = 0;

  for (const wpProduct of wpProducts) {
    const title = wpProduct.title;
    
    // Some titles might be in CDATA
    const name = typeof title === 'object' && title.__cdata ? title.__cdata : title;
    
    // Description
    const content = wpProduct['content:encoded'];
    const description = typeof content === 'object' && content.__cdata ? content.__cdata : (content || null);

    // Meta (Price, SKU)
    const postmeta = wpProduct['wp:postmeta'] || [];
    const metaArray = Array.isArray(postmeta) ? postmeta : [postmeta];
    
    let basePrice = 0;
    let sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    for (const meta of metaArray) {
      const key = meta['wp:meta_key'];
      const valueCdata = meta['wp:meta_value']?.__cdata;
      const value = valueCdata !== undefined ? valueCdata : meta['wp:meta_value'];
      
      if (key === '_price' && value) {
        basePrice = parseFloat(value);
      }
      if (key === '_sku' && value) {
        sku = value.toString().trim();
      }
    }

    // Default price if not found
    if (isNaN(basePrice)) basePrice = 0;
    
    // If SKU is empty string
    if (!sku) {
        sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    // Categories
    const categories = wpProduct.category || [];
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    const productCategories = categoryArray.filter((cat: any) => cat['@_domain'] === 'product_cat');
    
    let categoryId = null;
    
    if (productCategories.length > 0) {
      const catNameCdata = productCategories[0].__cdata;
      const catName = catNameCdata !== undefined ? catNameCdata : productCategories[0];
      
      // Upsert Category
      if (typeof catName === 'string' && catName.trim() !== '') {
        const category = await prisma.category.upsert({
          where: { name: catName.trim() },
          update: {},
          create: { name: catName.trim() }
        });
        categoryId = category.id;
      }
    }

    // Upsert Product
    try {
        await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: String(name),
            description: description ? String(description).substring(0, 500) : null, // Truncate description to avoid huge text blocks for now
            basePrice,
            categoryId
        },
        create: {
            name: String(name),
            description: description ? String(description).substring(0, 500) : null,
            basePrice,
            sku,
            categoryId
        }
        });
        count++;
    } catch (e: any) {
        console.warn(`Failed to insert product: ${name} (SKU: ${sku}). Reason: ${e.message}`);
    }
  }

  console.log(`\nSuccessfully imported ${count} products into the unified database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
