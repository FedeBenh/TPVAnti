"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSales() {
  return prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}

export async function createSale(data: {
  total: number;
  items: { productId?: string; customName?: string; quantity: number; unitPrice: number; unitCost?: number }[];
}) {
  const calculatedTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the sale
    const sale = await tx.sale.create({
      data: {
        total: calculatedTotal,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            customName: item.customName || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost || 0,
          })),
        },
      },
    });

    // 2. Decrease stock for each product (only if it has a productId)
    for (const item of data.items) {
      if (item.productId && !item.customName) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    return sale;
  });

  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/");
  return result;
}

function getLogicalDayStart() {
  const now = new Date();
  const currentHour = now.getHours();
  const start = new Date(now);
  if (currentHour < 7) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(7, 0, 0, 0);
  return start;
}

export async function getDashboardStats() {
  const today = getLogicalDayStart();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    salesToday,
    salesMonth,
    stockProducts,
    recentSales,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { active: true, trackStock: true },
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
      },
    }),
  ]);

  const lowStockProducts = stockProducts.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = stockProducts.filter(p => p.stock <= 0);

  return {
    salesTodayTotal: salesToday._sum.total || 0,
    salesMonthTotal: salesMonth._sum.total || 0,
    lowStockProducts,
    outOfStockProducts,
    recentSales,
  };
}
