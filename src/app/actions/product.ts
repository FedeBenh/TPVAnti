"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(familyId?: string) {
  return prisma.product.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: [{ familyId: "asc" }, { order: "asc" }],
    include: { family: true },
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { family: true },
  });
}

export async function createProduct(data: {
  name: string;
  familyId: string;
  salePrice: number;
  purchasePrice?: number;
  barcode?: string;
  order?: number;
  trackStock?: boolean;
  minStock?: number;
  active?: boolean;
}) {
  const result = await prisma.product.create({
    data: {
      name: data.name,
      familyId: data.familyId,
      salePrice: data.salePrice,
      purchasePrice: data.purchasePrice,
      barcode: data.barcode,
      order: data.order ?? 0,
      active: data.active ?? true,
      trackStock: data.trackStock ?? true,
      minStock: data.minStock ?? 5,
    },
  });
  revalidatePath("/products");
  revalidatePath("/pos");
  return result;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    familyId: string;
    salePrice: number;
    purchasePrice: number | null;
    barcode: string | null;
    order: number;
    active: boolean;
    trackStock: boolean;
    minStock: number;
  }>
) {
  const result = await prisma.product.update({
    where: { id },
    data,
  });
  revalidatePath("/products");
  revalidatePath("/pos");
  return result;
}

export async function deleteProduct(id: string) {
  const result = await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/products");
  revalidatePath("/pos");
  return result;
}

export async function updateProductStock(id: string, incrementBy: number) {
  const result = await prisma.product.update({
    where: { id },
    data: {
      stock: {
        increment: incrementBy,
      },
    },
  });
  revalidatePath("/products");
  return result;
}
