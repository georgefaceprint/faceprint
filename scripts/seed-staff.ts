import { Client } from 'pg';
import crypto from 'crypto';

import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log('Wiping existing users...');
  await client.query('DELETE FROM "User"');

  const staff = [
    { firstName: 'George', lastName: '', phone: '0820000001', role: 'ADMIN' },
    { firstName: 'Tanya', lastName: '', phone: '0820000002', role: 'ADMIN' },
    { firstName: 'Cherine', lastName: '', phone: '0820000003', role: 'ADMIN' },
  ];

  console.log('Seeding staff members...');
  for (const s of staff) {
    await client.query(
      `INSERT INTO "User" (id, "firstName", "lastName", phone, email, role, "passwordHash", "passcodeSetup", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [crypto.randomUUID(), s.firstName, s.lastName, s.phone, `${s.firstName.toLowerCase()}@faceprint.local`, s.role, '', false]
    );
    console.log(`Created ${s.firstName} with phone ${s.phone}`);
  }

  console.log('Seed completed successfully.');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
