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
  await prisma.user.update({
    where: { phone },
    data: {
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
