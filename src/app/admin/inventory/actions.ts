'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const basePrice = parseFloat(formData.get('basePrice') as string) || 0;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const categoryId = formData.get('categoryId') as string;

  await prisma.product.create({
    data: {
      name,
      sku,
      basePrice,
      description,
      imageUrl,
      ...(categoryId ? { categoryId } : {})
    }
  });

  revalidatePath('/admin/inventory');
  revalidatePath('/products');
  redirect('/admin/inventory');
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const basePrice = parseFloat(formData.get('basePrice') as string) || 0;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const categoryId = formData.get('categoryId') as string;

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      sku,
      basePrice,
      description,
      imageUrl,
      categoryId: categoryId || null
    }
  });

  revalidatePath('/admin/inventory');
  revalidatePath('/products');
  redirect('/admin/inventory');
}
