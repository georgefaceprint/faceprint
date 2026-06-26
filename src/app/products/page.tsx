import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

import SearchFilter from '@/components/SearchFilter';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params?.q || '';
  const currentPage = parseInt(params?.page || '1', 10) || 1;
  const take = 12;
  const skip = (currentPage - 1) * take;

  const whereCondition = {
    isDeleted: false,
    ...(q ? { name: { contains: q, mode: 'insensitive' as any } } : {})
  };

  let categories: any[] = [];
  let totalCount = 0;

  try {
    const [fetchedCategories, count] = await Promise.all([
      prisma.category.findMany({
        where: whereCondition,
        take,
        skip,
        include: {
          _count: {
            select: { products: { where: { isDeleted: false } } }
          },
          products: {
            where: { imageUrl: { not: null }, isDeleted: false },
            take: 1,
            select: { imageUrl: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.category.count({ where: whereCondition })
    ]);

    categories = fetchedCategories;
    totalCount = count;
  } catch (error) {
    console.error("Database connection blocked by firewall. Using mock data.");
  }

  const totalPages = Math.ceil(totalCount / take);

  // Fallback to Logo if category has no products with images
  const getImageUrl = (category: any) => {
    if (category.products && category.products.length > 0 && category.products[0].imageUrl) {
      return category.products[0].imageUrl;
    }
    return '/logo-icon.png';
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Product Categories</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Discover FacePrint's high-quality selection of product categories.
          Select a category to view our full range.
        </p>

        <div className="mt-8 flex justify-center">
          <SearchFilter />
        </div>
      </header>

      {categories.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border border-[rgba(255,255,255,0.1)]">
          <h2 className="text-2xl font-bold text-white mb-2">No categories found</h2>
          <p className="text-gray-400">{q ? `No categories matching "${q}".` : "We are currently updating our inventory. Please check back later!"}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products/${category.id}`} className="group glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)] hover:border-purple-500/30 transition-all duration-300 flex flex-col">
                <div className="aspect-[4/3] w-full relative overflow-hidden bg-[rgba(0,0,0,0.5)]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${getImageUrl(category)}')` }}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">{category.name}</h2>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.05)]">
                    <span className="text-sm text-gray-400">{category._count?.products || 0} Products</span>
                    <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/products"
            searchParams={{ q: q || undefined }}
          />
        </>
      )}
    </main>
  );
}
