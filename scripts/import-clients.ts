import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting client import...');
  
  const jsonPath = path.join(process.cwd(), 'clients.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('clients.json not found in the root directory.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch (e) {
    console.error('Failed to parse clients.json', e);
    process.exit(1);
  }

  const tableData = parsed.find((p: any) => p.type === 'table' && p.name === 'clients');
  if (!tableData || !tableData.data) {
    console.error('Could not find table "clients" with data in the JSON file.');
    process.exit(1);
  }

  const clients = tableData.data;
  console.log(`Found ${clients.length} clients in JSON export. Inserting into database...`);

  let count = 0;
  let skipped = 0;

  const emailMap = new Map<string, string>(); // tracking email -> legacyId
  const upserts = [];
  
  for (const client of clients) {
    const legacyId = client.ID?.toString();
    if (!legacyId) continue;
    
    const companyName = client.CNN || '';
    const contactName = client.CP || client.CNN || 'Unknown';
    let email = client.EM || '';
    const phone = client.CN || client.ONUM || '';
    const addressLine1 = client.STR || '';
    const city = client.TWN || '';
    const state = client.PRO || '';
    
    email = email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      email = `client_${legacyId}@no-email.faceprint.co.za`;
    }

    if (emailMap.has(email) && emailMap.get(email) !== legacyId) {
       const parts = email.split('@');
       email = `${parts[0]}+${legacyId}@${parts[1]}`;
    }
    emailMap.set(email, legacyId);

    upserts.push(
      prisma.client.upsert({
        where: { legacyId }, 
        update: {
          companyName,
          contactName,
          email,
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
      })
    );
  }

  // Execute in chunks
  const chunkSize = 100;
  for (let i = 0; i < upserts.length; i += chunkSize) {
     const chunk = upserts.slice(i, i + chunkSize);
     try {
       await Promise.all(chunk);
       count += chunk.length;
       console.log(`Imported ${count} clients...`);
     } catch (err: any) {
       console.error(`Error in chunk ${i} - ${i + chunkSize}:`, err.message);
       skipped += chunk.length;
     }
  }

  console.log(`\nImport complete!`);
  console.log(`Successfully imported/updated: ${count}`);
  console.log(`Skipped (duplicates/errors): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
