'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function softDeleteProduct(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { isDeleted: true }
  });
  revalidatePath('/admin/inventory');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function restoreProduct(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { isDeleted: false }
  });
  revalidatePath('/admin/inventory');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function hardDeleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId }
  });
  revalidatePath('/admin/inventory');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function toggleHotCategory(categoryId: string, isHot: boolean) {
  await prisma.category.update({
    where: { id: categoryId },
    data: { isHotCategory: isHot }
  });
  revalidatePath('/admin/inventory');
  revalidatePath('/');
}
