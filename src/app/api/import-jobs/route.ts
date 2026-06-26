import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { JobStatus } from '@prisma/client';

// Allow a longer execution time for Vercel
export const maxDuration = 300; // 5 minutes

export async function GET() {
  console.log('Starting job.json migration via API...');

  try {
    const jsonPath = path.join(process.cwd(), 'job.json');
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'job.json not found in the root directory.' }, { status: 404 });
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(rawData);

    const tableData = parsed.find((p: any) => p.type === 'table' && p.name === 'job');
    if (!tableData || !tableData.data) {
      return NextResponse.json({ error: 'Could not find table job in JSON' }, { status: 400 });
    }

    const jobs = tableData.data;
    console.log(`Found ${jobs.length} jobs in JSON export. Starting import...`);

    // Fallback Client
    const fallbackClient = await prisma.client.upsert({
      where: { email: 'legacy_unknown@faceprint.co.za' },
      update: {},
      create: {
        legacyId: 'UNKNOWN',
        companyName: 'Legacy Unknown Client',
        contactName: 'Unknown',
        email: 'legacy_unknown@faceprint.co.za',
        phone: '0000000000',
      }
    });

    let count = 0;
    let skipped = 0;

    for (const job of jobs) {
      const legacyJobId = job.ID?.toString();
      const legacyClientId = job.FID?.toString();
      
      if (!legacyJobId) {
        skipped++;
        continue;
      }

      let client = null;
      if (legacyClientId) {
        client = await prisma.client.findFirst({
          where: { legacyId: legacyClientId }
        });
      }

      if (!client) {
        client = fallbackClient;
      }

      let mappedStatus: JobStatus = JobStatus.COMPLETED;
      const legacyStatus = (job.PRI || '').toUpperCase();
      if (legacyStatus === 'QUOTED') mappedStatus = JobStatus.QUOTED;
      else if (legacyStatus === 'INVOICED') mappedStatus = JobStatus.INVOICED;
      else if (legacyStatus === 'DELIVERED') mappedStatus = JobStatus.DELIVERED;
      else if (legacyStatus === 'PENDING') mappedStatus = JobStatus.PENDING;

      let createdAt = new Date();
      if (job.DT) {
        createdAt = new Date(job.DT);
      } else if (job.ADATE) {
        createdAt = new Date(job.ADATE);
      }
      if (isNaN(createdAt.getTime())) {
        createdAt = new Date();
      }

      const jobNumber = job.QN || job.INV || `LEGACY-${legacyJobId}`;
      const description = job.DESCY || '';
      const totalAmount = parseFloat(job.TCST) || 0;
      const balance = parseFloat(job.BAL) || 0;

      try {
        const newJob = await prisma.job.upsert({
          where: { id: `legacy-${legacyJobId}` },
          update: {
            jobNumber,
            status: mappedStatus,
            description,
            totalAmount,
            balance,
            createdAt,
            clientId: client.id,
          },
          create: {
            id: `legacy-${legacyJobId}`,
            jobNumber,
            status: mappedStatus,
            description,
            totalAmount,
            balance,
            createdAt,
            clientId: client.id,
          }
        });

        await prisma.jobItem.deleteMany({
          where: { jobId: newJob.id }
        });

        const itemsToCreate = [];
        for (let i = 1; i <= 8; i++) {
          const pdt = job[`PDT${i}`];
          if (pdt && typeof pdt === 'string' && pdt.trim() !== '') {
            const qty = parseInt(job[`QTY${i}`]) || 1;
            const unitPrice = parseFloat(job[`CST${i}`]) || 0;
            const lineDescription = job[`DC${i}`] || pdt;
            const totalPrice = qty * unitPrice;

            itemsToCreate.push({
              jobId: newJob.id,
              description: lineDescription,
              quantity: qty,
              unitPrice: unitPrice,
              totalPrice: totalPrice,
            });
          }
        }

        if (itemsToCreate.length > 0) {
          await prisma.jobItem.createMany({
            data: itemsToCreate
          });
        }

        count++;
        if (count % 500 === 0) {
          console.log(`Imported ${count} jobs...`);
        }

      } catch (err: any) {
        console.error(`Failed to import job ${legacyJobId}: ${err.message}`);
        skipped++;
      }
    }

    console.log(`Job Migration Complete! Imported: ${count}, Skipped: ${skipped}`);
    return NextResponse.json({ success: true, count, skipped });

  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
