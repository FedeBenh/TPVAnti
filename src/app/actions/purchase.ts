"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchases() {
  return prisma.purchase.findMany({
    orderBy: { date: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}

export async function createPurchase(data: {
  supplier?: string;
  items: { productId: string; quantity: number; cost?: number }[];
}) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the purchase
    const purchase = await tx.purchase.create({
      data: {
        supplier: data.supplier,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
          })),
        },
      },
    });

    // 2. Update stock for each product
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    return purchase;
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  revalidatePath("/");
  return result;
}
