"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/app/actions/product";
import { toast } from "sonner";
import { Plus, Image as ImageIcon } from "lucide-react";

type ProductType = {
  id: string;
  name: string;
  familyId: string;
  salePrice: number;
  purchasePrice: number | null;
  barcode: string | null;
  order: number;
  active: boolean;
  trackStock: boolean;
  minStock: number;
  image?: string | null;
};

export function ProductDialog({
  product,
  families,
}: {
  product?: ProductType;
  families: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageBase64, setImageBase64] = useState<string | null>(product?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    const familyId = formData.get("familyId") as string;
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const purchasePriceStr = formData.get("purchasePrice") as string;
    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null;
    const barcode = (formData.get("barcode") as string) || null;
    const order = parseInt(formData.get("order") as string, 10);
    const trackStock = formData.get("trackStock") === "on";
    const minStock = parseInt(formData.get("minStock") as string, 10) || 0;

    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, {
            name,
            familyId,
            salePrice,
            purchasePrice,
            barcode,
            order,
            trackStock,
            minStock,
            image: imageBase64,
          });
          toast.success("Producto actualizado");
        } else {
          await createProduct({
            name,
            familyId,
            salePrice,
            purchasePrice: purchasePrice ?? undefined,
            barcode: barcode ?? undefined,
            order,
            trackStock,
            minStock,
            image: imageBase64,
          });
          toast.success("Producto creado");
        }
        setOpen(false);
      } catch (error) {
        toast.error("Error al guardar el producto");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setImageBase64(product?.image || null);
    }}>
      {/* @ts-expect-error react 19 compatibility */}
      <DialogTrigger asChild>
        {product ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Artículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Artículo" : "Nuevo Artículo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <div 
                className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/20 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                Seleccionar Foto
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="familyId">Familia</Label>
              <Select name="familyId" defaultValue={product?.familyId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una familia" />
                </SelectTrigger>
                <SelectContent>
                  {families.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salePrice">Precio de Venta (€)</Label>
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.salePrice}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Coste (opcional)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.purchasePrice ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="barcode">Cód. Barras</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  defaultValue={product?.barcode ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={product?.order ?? 0}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="trackStock"
                  name="trackStock"
                  className="h-4 w-4 rounded border-gray-300"
                  defaultChecked={product ? product.trackStock : true}
                />
                <Label htmlFor="trackStock">Tratar Stock</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock">Alerta Stock Mínimo</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  defaultValue={product?.minStock ?? 5}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
