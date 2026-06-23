import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

function generateUUID() {
    return crypto.randomUUID();
}

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

  const categoriesMap = new Map<string, string>(); // name -> id
  const sqlStatements: string[] = [];

  for (const wpProduct of wpProducts) {
    const title = wpProduct.title;
    const name = typeof title === 'object' && title.__cdata ? title.__cdata : title;
    
    const content = wpProduct['content:encoded'];
    const description = typeof content === 'object' && content.__cdata ? content.__cdata : (content || null);
    const safeDesc = description ? description.toString().substring(0, 500).replace(/'/g, "''") : '';

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
    
    let categoryId: string | null = null;
    
    if (productCategories.length > 0) {
      const catObj = productCategories[0];
      const catNameRaw = typeof catObj === 'object' && catObj.__cdata ? catObj.__cdata : (catObj['#text'] || catObj);
      const catName = typeof catNameRaw === 'string' ? catNameRaw.trim().replace(/'/g, "''") : '';
      
      if (catName !== '') {
        if (!categoriesMap.has(catName)) {
            const newCatId = generateUUID();
            categoriesMap.set(catName, newCatId);
            sqlStatements.push(`INSERT INTO "Category" (id, name) VALUES ('${newCatId}', '${catName}') ON CONFLICT (name) DO NOTHING;`);
        }
        categoryId = categoriesMap.get(catName) || null;
      }
    }

    const safeName = String(name).replace(/'/g, "''");
    const safeSku = String(sku).replace(/'/g, "''");
    const prodId = generateUUID();
    const now = new Date().toISOString();

    const catIdValue = categoryId ? `'${categoryId}'` : 'NULL';
    const descValue = safeDesc ? `'${safeDesc}'` : 'NULL';

    sqlStatements.push(`INSERT INTO "Product" (id, name, description, "basePrice", sku, "categoryId", "createdAt", "updatedAt") VALUES ('${prodId}', '${safeName}', ${descValue}, ${basePrice}, '${safeSku}', ${catIdValue}, '${now}', '${now}') ON CONFLICT (sku) DO NOTHING;`);
  }

  const outPath = path.join(process.cwd(), 'products.sql');
  fs.writeFileSync(outPath, sqlStatements.join('\n'));
  console.log(`Generated ${sqlStatements.length} SQL statements to ${outPath}`);
}

main().catch(console.error);
