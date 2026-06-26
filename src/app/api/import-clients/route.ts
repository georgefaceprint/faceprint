import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Starting client import...');
    
    const jsonPath = path.join(process.cwd(), 'clients.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'clients.json not found' }, { status: 404 });
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse clients.json' }, { status: 500 });
    }

    const tableData = parsed.find((p: any) => p.type === 'table' && p.name === 'clients');
    if (!tableData || !tableData.data) {
      return NextResponse.json({ error: 'Could not find table clients' }, { status: 500 });
    }

    const clients = tableData.data;
    console.log(`Found ${clients.length} clients in JSON export. Inserting into database...`);

    let count = 0;
    let skipped = 0;

    for (const client of clients) {
      const legacyId = client.ID?.toString();
      const companyName = client.CNN || '';
      const contactName = client.CP || client.CNN || 'Unknown';
      let email = client.EM || '';
      const phone = client.CN || client.ONUM || '';
      const addressLine1 = client.STR || '';
      const city = client.TWN || '';
      const state = client.PRO || '';
      
      email = email.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        email = `client_${legacyId || Date.now()}@no-email.faceprint.co.za`;
      }

      try {
        await prisma.client.upsert({
          where: { email },
          update: {
            legacyId,
            companyName,
            contactName,
            phone,
            addressLine1,
            city,
            state,
          },
          create: {
            legacyId,
            companyName,
            contactName,
            email,
            phone,
            addressLine1,
            city,
            state,
          }
        });
        count++;
        if (count % 100 === 0) {
          console.log(`Imported ${count} clients...`);
        }
      } catch (err: any) {
        skipped++;
      }
    }

    return NextResponse.json({
      message: 'Import complete!',
      imported: count,
      skipped,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
