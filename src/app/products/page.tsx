import { getProducts } from "@/app/actions/product";
import { getFamilies } from "@/app/actions/family";
import { ProductDialog } from "./product-dialog";
import { DeleteProductButton } from "./delete-product-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
  const [products, families] = await Promise.all([
    getProducts(),
    getFamilies(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Artículos</h1>
        <ProductDialog families={families} />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay artículos registrados.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.family.name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {product.salePrice.toFixed(2)} €
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={product.stock <= 0 ? "destructive" : "outline"}>
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ProductDialog product={product} families={families} />
                    <DeleteProductButton id={product.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
