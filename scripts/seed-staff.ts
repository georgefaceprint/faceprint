import { PrismaClient, Role } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Local Prisma dev server URL
const connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const staffToMigrate = [
  {
    firstName: 'George',
    email: 'info@faceprint.co.za',
    plainPassword: 'GEORGES1973',
    role: Role.ADMIN,
  },
  {
    firstName: 'Cherine',
    email: 'sales@faceprint.co.za',
    plainPassword: 'PURPLE',
    role: Role.ADMIN, // Or SALES based on your new roles
  },
  {
    firstName: 'Tanya',
    email: 'online@faceprint.co.za',
    plainPassword: 'CHERYLL',
    role: Role.ADMIN,
  }
];

async function main() {
  console.log('Starting staff migration...');

  for (const staff of staffToMigrate) {
    const { firstName, email, plainPassword, role } = staff;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Skipping...`);
      continue;
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        email,
        passwordHash,
        role
      }
    });

    console.log(`Migrated user: ${firstName} (${email})`);
  }

  console.log('Staff migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error migrating staff:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
