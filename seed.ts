import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

async function main() {
  const xmlPath = path.join(process.cwd(), 'products.xml');
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
  });
  
  const parsed = parser.parse(xmlData);
  const items = parsed.rss?.channel?.item || [];
  const products = Array.isArray(items) ? items : [items];
  
  const wpProducts = products.filter((item: any) => {
    const type = item['wp:post_type'];
    const typeStr = typeof type === 'object' && type.__cdata ? type.__cdata : type;
    return typeStr === 'product';
  });

  console.log(`Found ${wpProducts.length} products`);

  let count = 0;

  for (const wpProduct of wpProducts) {
    const title = wpProduct.title;
    const name = typeof title === 'object' && title.__cdata ? title.__cdata : title;
    
    const content = wpProduct['content:encoded'];
    const description = typeof content === 'object' && content.__cdata ? content.__cdata : (content || null);

    const postmeta = wpProduct['wp:postmeta'] || [];
    const metaArray = Array.isArray(postmeta) ? postmeta : [postmeta];
    
    let basePrice = 0;
    let sku = '';

    for (const meta of metaArray) {
      const key = meta['wp:meta_key'];
      let valueCdata = meta['wp:meta_value'];
      if (typeof valueCdata === 'object' && valueCdata !== null) {
        valueCdata = valueCdata.__cdata;
      }
      
      const value = valueCdata !== undefined ? valueCdata : meta['wp:meta_value'];
      
      if (key === '_price' && value) {
        basePrice = parseFloat(value);
      }
      if (key === '_sku' && value) {
        sku = value.toString().trim();
      }
    }

    if (isNaN(basePrice)) basePrice = 0;
    if (!sku) sku = `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const categories = wpProduct.category || [];
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    const productCategories = categoryArray.filter((cat: any) => cat['@_domain'] === 'product_cat');
    
    let categoryId = null;
    
    if (productCategories.length > 0) {
      const catObj = productCategories[0];
      const catName = typeof catObj === 'object' && catObj.__cdata ? catObj.__cdata : (catObj['#text'] || catObj);
      
      if (typeof catName === 'string' && catName.trim() !== '') {
        try {
          const category = await prisma.category.upsert({
            where: { name: catName.trim() },
            update: {},
            create: { name: catName.trim() }
          });
          categoryId = category.id;
        } catch (e: any) {
          console.error(`Failed to upsert category: ${catName}`, e.message);
        }
      }
    }

    try {
        await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: String(name),
            description: description ? String(description).substring(0, 500) : null,
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
        console.warn(`Failed to insert product: ${name}`, e.message);
    }
  }

  console.log(`Successfully imported ${count} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
