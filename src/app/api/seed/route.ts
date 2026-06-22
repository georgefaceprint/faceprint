import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

export async function GET() {
  try {
    // 1. Seed Staff
    console.log('Seeding staff...');
    const staff = [
      { firstName: 'George', lastName: '', phone: '0820000001', role: 'ADMIN' },
      { firstName: 'Tanya', lastName: '', phone: '0820000002', role: 'ADMIN' },
      { firstName: 'Cherine', lastName: '', phone: '0820000003', role: 'ADMIN' },
    ];

    for (const s of staff) {
      await prisma.user.upsert({
        where: { email: `${s.firstName.toLowerCase()}@faceprint.local` },
        update: {},
        create: {
          firstName: s.firstName,
          lastName: s.lastName,
          phone: s.phone,
          email: `${s.firstName.toLowerCase()}@faceprint.local`,
          role: s.role as any,
          passwordHash: '',
          passcodeSetup: false,
        }
      });
    }

    // 2. Import Products
    const xmlPath = path.join(process.cwd(), 'products.xml');
    if (!fs.existsSync(xmlPath)) {
      return NextResponse.json({ message: 'Staff seeded, but products.xml not found on server' });
    }

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
        const valueCdata = meta['wp:meta_value']?.__cdata;
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
        const catNameCdata = productCategories[0].__cdata;
        const catName = catNameCdata !== undefined ? catNameCdata : productCategories[0];
        
        if (typeof catName === 'string' && catName.trim() !== '') {
          const category = await prisma.category.upsert({
            where: { name: catName.trim() },
            update: {},
            create: { name: catName.trim() }
          });
          categoryId = category.id;
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
          console.warn(`Failed to insert product: ${name}`);
      }
    }

    return NextResponse.json({ 
        message: 'Successfully seeded staff and imported products!',
        staffCount: staff.length,
        importedProducts: count 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
