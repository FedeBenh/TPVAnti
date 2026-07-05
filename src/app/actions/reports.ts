"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

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

export async function getDailySalesReportData() {
  const todayStart = getLogicalDayStart();

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: todayStart } },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: string[][] = [];
  let totalTM = 0;
  let totalTT = 0;
  let totalDia = 0;

  for (const sale of sales) {
    const saleDate = new Date(sale.createdAt);
    const hour = saleDate.getHours();
    
    // TM: 07:00 to 16:59. TT: 17:00 to 06:59
    const isTM = hour >= 7 && hour < 17;
    
    if (isTM) totalTM += sale.total;
    else totalTT += sale.total;
    
    totalDia += sale.total;

    const time = format(saleDate, "HH:mm");
    const ticketId = sale.id.split("-")[0];
    for (const item of sale.items) {
      rows.push([
        ticketId,
        time,
        item.product?.name || item.customName || "Artículo Genérico",
        item.quantity.toString(),
        item.unitPrice.toFixed(2),
        (item.quantity * item.unitPrice).toFixed(2),
      ]);
    }
  }

  return { rows, totalTM, totalTT, totalDia };
}

export async function getMonthlySalesReportData() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfMonth } },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: string[][] = [];
  for (const sale of sales) {
    const date = format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm");
    const ticketId = sale.id.split("-")[0];
    rows.push([date, ticketId, sale.total.toFixed(2)]);
  }

  return rows;
}

export async function getFamilySalesReportData(period?: "day" | "month") {
  let dateFilter = {};
  if (period === "day") {
    dateFilter = { gte: getLogicalDayStart() };
  } else if (period === "month") {
    const today = new Date();
    dateFilter = { gte: new Date(today.getFullYear(), today.getMonth(), 1) };
  }

  const sales = await prisma.sale.findMany({
    where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : undefined,
    include: {
      items: {
        include: { product: { include: { family: true } } },
      },
    },
  });

  const familyStats: Record<string, { name: string; quantity: number; total: number }> = {};
  let totalDia = 0;

  for (const sale of sales) {
    for (const item of sale.items) {
      const familyId = item.product?.familyId || "manual";
      const familyName = item.product?.family?.name || "Artículos Manuales";
      if (!familyStats[familyId]) {
        familyStats[familyId] = { name: familyName, quantity: 0, total: 0 };
      }
      familyStats[familyId].quantity += item.quantity;
      const itemTotal = item.quantity * item.unitPrice;
      familyStats[familyId].total += itemTotal;
      totalDia += itemTotal;
    }
  }

  const rows: string[][] = [];
  for (const stats of Object.values(familyStats)) {
    rows.push([stats.name, stats.quantity.toString(), stats.total.toFixed(2)]);
  }

  return { rows, totalDia };
}
