import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Local Prisma dev server URL
const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Loading JSON file (this might take a moment)...');
  const rawData = fs.readFileSync('./clients.json', 'utf8');
  const dump = JSON.parse(rawData);

  // Find the clients table
  const clientsTable = dump.find((item: any) => item.type === 'table' && item.name === 'clients');

  if (!clientsTable || !clientsTable.data) {
    throw new Error('Could not find clients table in JSON dump.');
  }

  console.log(`Found ${clientsTable.data.length} clients to migrate.`);

  let migratedCount = 0;
  let skippedCount = 0;
  const processedEmails = new Set<string>();

  for (const oldClient of clientsTable.data) {
    let email = oldClient.EM ? oldClient.EM.trim().toLowerCase() : '';
    
    // Validate and sanitize email
    if (!email || email === 'na' || email === 'test' || !email.includes('@')) {
      email = `unknown-${oldClient.ID}@faceprint.local`;
    }

    // Ensure email is unique across the migration
    if (processedEmails.has(email)) {
      email = `duplicate-${oldClient.ID}-${email}`;
    }
    processedEmails.add(email);

    const companyName = oldClient.CNN ? oldClient.CNN.trim() : null;
    const contactName = oldClient.CP ? oldClient.CP.trim() : (companyName || 'Unknown Contact');
    const phone = oldClient.CN ? oldClient.CN.trim() : null;
    const addressLine1 = oldClient.STR ? oldClient.STR.trim() : null;
    const city = oldClient.TWN ? oldClient.TWN.trim() : null;
    const state = oldClient.PRO ? oldClient.PRO.trim() : null;

    try {
      await prisma.client.create({
        data: {
          legacyId: String(oldClient.ID),
          email,
          contactName,
          companyName,
          phone,
          addressLine1,
          city,
          state,
          // Not setting userId right now, we can link it later if needed
        }
      });
      migratedCount++;
    } catch (error) {
      console.error(`Failed to migrate client ID ${oldClient.ID} (${email}):`, error);
      skippedCount++;
    }
  }

  console.log(`Migration finished! Successfully migrated: ${migratedCount}, Skipped/Failed: ${skippedCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
