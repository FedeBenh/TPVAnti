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

export async function getProfitReportData(period?: "day" | "month") {
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

  const productStats: Record<string, { 
    name: string; 
    family: string; 
    quantity: number; 
    revenue: number; 
    cost: number;
    profit: number;
  }> = {};
  
  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;

  for (const sale of sales) {
    for (const item of sale.items) {
      // Use productId as key, or customName if manual
      const key = item.productId || item.customName || "manual-" + Math.random();
      const name = item.product?.name || item.customName || "Artículo Genérico";
      const familyName = item.product?.family?.name || "Artículos Manuales";
      
      if (!productStats[key]) {
        productStats[key] = { name, family: familyName, quantity: 0, revenue: 0, cost: 0, profit: 0 };
      }
      
      const qty = item.quantity;
      const rev = qty * item.unitPrice;
      // If historical items don't have unitCost, we fallback to product's purchasePrice if available, otherwise 0
      const unitC = item.unitCost ?? (item.product?.purchasePrice || 0);
      const cost = qty * unitC;
      const profit = rev - cost;

      productStats[key].quantity += qty;
      productStats[key].revenue += rev;
      productStats[key].cost += cost;
      productStats[key].profit += profit;

      totalRevenue += rev;
      totalCost += cost;
      totalProfit += profit;
    }
  }

  const rows: string[][] = [];
  for (const stats of Object.values(productStats)) {
    rows.push([
      stats.name, 
      stats.family, 
      stats.quantity.toString(), 
      stats.revenue.toFixed(2), 
      stats.cost.toFixed(2), 
      stats.profit.toFixed(2)
    ]);
  }

  return { rows, totalRevenue, totalCost, totalProfit };
}
