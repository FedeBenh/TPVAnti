import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    include: { items: true },
  });

  let fixed = 0;
  for (const sale of sales) {
    if (sale.total === 0 && sale.items.length > 0) {
      const correctTotal = sale.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      await prisma.sale.update({
        where: { id: sale.id },
        data: { total: correctTotal },
      });
      fixed++;
    }
  }

  console.log(`Arregladas ${fixed} ventas con total = 0.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
