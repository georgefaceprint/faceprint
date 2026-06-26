import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting products import...');
    
    const jsonPath = path.join(process.cwd(), 'products.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'products.json not found' }, { status: 404 });
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse products.json' }, { status: 500 });
    }

    const tableData = parsed.find((p: any) => p.type === 'table' && p.name === 'products');
    if (!tableData || !tableData.data) {
      return NextResponse.json({ error: 'Could not find table products' }, { status: 500 });
    }

    const products = tableData.data;
    console.log(`Found ${products.length} products in JSON export. Inserting into database...`);

    let count = 0;
    let skipped = 0;

    for (const prod of products) {
      const legacyId = prod.ID?.toString();
      if (!legacyId) continue;
      
      const name = prod.PDCT || 'Unknown Product';
      const description = prod.DESCR || prod.DESC || '';
      const sku = `SKU-${legacyId}`;
      const basePrice = 0; // Legacy data doesn't have prices in this dump

      try {
        await prisma.product.upsert({
          where: { sku },
          update: {
            name,
            description,
            basePrice
          },
          create: {
            name,
            description,
            sku,
            basePrice
          }
        });
        count++;
      } catch (err: any) {
        skipped++;
      }
    }

    return NextResponse.json({
      message: 'Product Import complete!',
      imported: count,
      skipped,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
