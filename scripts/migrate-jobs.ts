import fs from 'fs';
import { PrismaClient, JobStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Local Prisma dev server URL
const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function mapPriorityToStatus(priority: string | null): JobStatus {
  if (!priority) return JobStatus.PENDING;
  
  const p = priority.toUpperCase().trim();
  if (p === 'DELIVERED') return JobStatus.DELIVERED;
  if (p === 'COLLECTED') return JobStatus.COMPLETED;
  if (p === 'INVOICED') return JobStatus.INVOICED;
  if (p === 'QUOTED') return JobStatus.QUOTED;
  
  // WARM, HOT, etc could mean IN_PRODUCTION or PENDING depending on workflow
  if (p === 'HOT' || p === 'WARM') return JobStatus.IN_PRODUCTION;
  
  return JobStatus.PENDING;
}

async function main() {
  console.log('Loading job.json file...');
  const rawData = fs.readFileSync('./job.json', 'utf8');
  const dump = JSON.parse(rawData);

  // Find the job table
  const jobTable = dump.find((item: any) => item.type === 'table' && item.name === 'job');

  if (!jobTable || !jobTable.data) {
    throw new Error('Could not find job table in JSON dump.');
  }

  console.log(`Found ${jobTable.data.length} jobs to migrate.`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const oldJob of jobTable.data) {
    const legacyClientId = oldJob.FID ? String(oldJob.FID).trim() : null;
    
    if (!legacyClientId) {
      console.warn(`Job ${oldJob.ID} has no Client ID. Skipping.`);
      skippedCount++;
      continue;
    }

    // Try to find the associated client
    const client = await prisma.client.findUnique({
      where: { legacyId: legacyClientId }
    });

    if (!client) {
      console.warn(`Could not find client with legacyId ${legacyClientId} for Job ${oldJob.ID}. Skipping.`);
      skippedCount++;
      continue;
    }

    const totalAmount = oldJob.TCST ? parseFloat(oldJob.TCST) : 0;
    const amountPaid = oldJob.DP ? parseFloat(oldJob.DP) : 0;
    const balance = oldJob.BAL ? parseFloat(oldJob.BAL) : 0;
    
    // Parse Date (ADATE or DT)
    let createdAt = new Date();
    if (oldJob.DT && oldJob.DT !== '0000-00-00') {
      const parsedDate = new Date(oldJob.DT);
      if (!isNaN(parsedDate.getTime())) {
        createdAt = parsedDate;
      }
    }

    try {
      // Check if job already exists
      const existingJob = await prisma.job.findUnique({
        where: { legacyId: String(oldJob.ID) }
      });
      if (existingJob) {
        skippedCount++;
        continue;
      }

      // Build the line items
      const items = [];
      for (let i = 1; i <= 8; i++) {
        const pdt = oldJob[`PDT${i}`];
        if (pdt && String(pdt).trim() !== '') {
          items.push({
            description: String(pdt).trim(),
            quantity: oldJob[`QTY${i}`] ? parseInt(oldJob[`QTY${i}`], 10) || 1 : 1,
            unitPrice: oldJob[`CST${i}`] ? parseFloat(oldJob[`CST${i}`]) || 0 : 0,
            totalPrice: 0 // Can be recalculated if needed, but not critical
          });
        }
      }

      const jobData: any = {
        legacyId: String(oldJob.ID),
        jobNumber: oldJob.QN || oldJob.INV || null,
        clientId: client.id,
        status: mapPriorityToStatus(oldJob.PRI),
        priority: oldJob.PRI ? String(oldJob.PRI) : null,
        totalAmount,
        amountPaid,
        balance,
        description: oldJob.DESCY ? String(oldJob.DESCY).trim() : null,
        notes: oldJob.NOS ? String(oldJob.NOS).trim() : null,
        createdAt,
        items: {
          create: items
        }
      };

      await prisma.job.create({
        data: jobData
      });

      migratedCount++;
    } catch (error) {
      console.error(`Failed to migrate Job ID ${oldJob.ID}:`, error);
      skippedCount++;
    }
  }

  console.log(`Jobs Migration finished! Successfully migrated: ${migratedCount}, Skipped/Failed: ${skippedCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
