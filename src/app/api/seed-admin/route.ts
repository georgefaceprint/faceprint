import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminPhone = '0000000000';
    const adminPassword = 'admin';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await prisma.user.findUnique({
      where: { phone: adminPhone },
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { phone: adminPhone },
        data: { passwordHash },
      });
      return NextResponse.json({ success: true, message: 'Admin password reset to "admin"' });
    }

    const user = await prisma.user.create({
      data: {
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        firstName: 'Master',
        lastName: 'Admin',
        passcodeSetup: true,
      },
    });

    return NextResponse.json({ success: true, message: `Created Admin User: ${user.firstName}` });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
