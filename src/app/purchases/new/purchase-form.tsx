"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPurchase } from "@/app/actions/purchase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type ProductType = {
  id: string;
  name: string;
  purchasePrice: number | null;
};

export function PurchaseForm({ products }: { products: ProductType[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<
    { productId: string; quantity: number; cost: number | "" }[]
  >([]);

  function addItem() {
    setItems([...items, { productId: "", quantity: 1, cost: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: string | number) {
    const newItems = [...items];
    if (field === "productId") {
      newItems[index].productId = value as string;
      const product = products.find((p) => p.id === value);
      if (product && product.purchasePrice != null) {
        newItems[index].cost = product.purchasePrice;
      }
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Añade al menos un artículo");
      return;
    }
    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      toast.error("Revisa los artículos añadidos");
      return;
    }

    startTransition(async () => {
      try {
        await createPurchase({
          supplier: supplier || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            cost: i.cost === "" ? undefined : Number(i.cost),
          })),
        });
        toast.success("Compra registrada correctamente");
        router.push("/purchases");
      } catch (error) {
        toast.error("Error al registrar la compra");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="supplier">Proveedor (Opcional)</Label>
        <Input
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Ej: Coca-Cola, Mercadona..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Artículos</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Línea
          </Button>
        </div>

        {items.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
            No has añadido artículos.
          </div>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-start border p-4 rounded-md">
            <div className="grid gap-2 flex-1">
              <Label>Producto</Label>
              <Select
                value={item.productId}
                onValueChange={(val) => val && updateItem(index, "productId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 w-24">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value) || 0)
                }
                required
              />
            </div>
            <div className="grid gap-2 w-32">
              <Label>Coste Un. (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.cost}
                onChange={(e) => updateItem(index, "cost", e.target.value)}
              />
            </div>
            <div className="pt-8">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar Compra"}
      </Button>
    </form>
  );
}
