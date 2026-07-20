export const dynamic = "force-dynamic";
import { getSales } from "@/app/actions/sale";
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

export default async function SalesPage() {
  const sales = await getSales();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Ventas</h1>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            )}
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">
                  {format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {sale.id.split("-")[0]}
                </TableCell>
                <TableCell>
                  {sale.items.map((i) => (
                    <div key={i.id} className="text-sm text-muted-foreground">
                      {i.quantity}x {i.product?.name || i.customName || "Artículo Genérico"}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {sale.total.toFixed(2)} €
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

