import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Fetch only ADMIN and SALES roles for the staff login page
  const staffUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SALES']
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: {
      firstName: 'asc'
    }
  });

  // Map the Prisma results to the UserProfile structure expected by the LoginForm
  const profiles = staffUsers.map((user, index) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-400 to-cyan-500',
      'from-orange-400 to-red-500',
      'from-yellow-400 to-orange-500',
    ];
    
    return {
      id: user.id,
      name: `${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim(),
      phone: user.phone || '',
      color: colors[index % colors.length],
      initial: (user.firstName?.[0] || user.phone?.[0] || '?').toUpperCase(),
    };
  });

  return <LoginForm profiles={profiles} />;
}
