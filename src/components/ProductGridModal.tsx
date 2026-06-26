import { prisma } from '@/lib/prisma';
import ProductGridClient from './ProductGridClient';

export default async function ProductGridModal() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isDeleted: false, isHotCategory: true },
      include: {
        products: {
          where: { isDeleted: false },
          take: 6,
          orderBy: { name: 'asc' }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 6
    });
  } catch (error) {
    console.error("Database connection blocked by firewall. Using mock data.");
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        No categories available at the moment.
      </div>
    );
  }

  return <ProductGridClient categories={categories} />;
}
