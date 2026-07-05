import { getFamilies } from "@/app/actions/family";
import { getProducts } from "@/app/actions/product";
import { PosClient } from "./pos-client";
import { MonitorPlay } from "lucide-react";
import Link from "next/link";

export default async function PosPage() {
  const [families, products] = await Promise.all([
    getFamilies(),
    getProducts(),
  ]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <header className="flex h-14 w-full items-center justify-between border-b px-4 lg:h-[60px] lg:px-6 shrink-0 bg-card">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MonitorPlay className="h-6 w-6 text-primary" />
          <span>Volver al Dashboard</span>
        </Link>
        <div className="font-semibold text-lg">TPV</div>
      </header>
      <PosClient families={families} products={products} />
    </div>
  );
}
