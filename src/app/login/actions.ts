'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function checkSetupStatus(phone: string) {
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { passcodeSetup: true }
  });
  return user?.passcodeSetup ?? null;
}

export async function setupPasscode(phone: string, passcode: string) {
  const passwordHash = await bcrypt.hash(passcode, 10);
  
  // Need to map the phone to the user's name to ensure we create them correctly if they don't exist
  const profiles: Record<string, any> = {
    '0820000001': { firstName: 'George', role: 'ADMIN' },
    '0820000002': { firstName: 'Tanya', role: 'SALES' },
    '0820000003': { firstName: 'Cherine', role: 'SALES' }
  };
  
  const profile = profiles[phone] || { firstName: 'Staff', role: 'SALES' };

  await prisma.user.upsert({
    where: { phone },
    update: {
      passwordHash,
      passcodeSetup: true
    },
    create: {
      phone,
      firstName: profile.firstName,
      role: profile.role,
      passwordHash,
      passcodeSetup: true
    }
  });
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid passcode.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
