"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFamilies() {
  return prisma.family.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getFamily(id: string) {
  return prisma.family.findUnique({
    where: { id },
  });
}

export async function createFamily(data: { name: string; order?: number }) {
  const result = await prisma.family.create({
    data: {
      name: data.name,
      order: data.order ?? 0,
    },
  });
  revalidatePath("/families");
  return result;
}

export async function updateFamily(
  id: string,
  data: { name?: string; order?: number }
) {
  const result = await prisma.family.update({
    where: { id },
    data,
  });
  revalidatePath("/families");
  return result;
}

export async function deleteFamily(id: string) {
  const result = await prisma.family.delete({
    where: { id },
  });
  revalidatePath("/families");
  return result;
}
