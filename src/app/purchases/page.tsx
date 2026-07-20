export const dynamic = "force-dynamic";
import { getPurchases } from "@/app/actions/purchase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Compras</h1>
        <Link href="/purchases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compra
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-right">Total Coste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No hay compras registradas.
                </TableCell>
              </TableRow>
            )}
            {purchases.map((purchase) => {
              const totalCost = purchase.items.reduce(
                (acc, item) => acc + (item.cost || 0) * item.quantity,
                0
              );
              return (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {format(new Date(purchase.date), "dd MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{purchase.supplier || "—"}</TableCell>
                  <TableCell>
                    {purchase.items.map((i) => (
                      <div key={i.id} className="text-sm text-muted-foreground">
                        {i.quantity}x {i.product.name}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    {totalCost > 0 ? `${totalCost.toFixed(2)} €` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

