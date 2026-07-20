"use client";

import { useState, useTransition } from "react";
import { usePosStore } from "@/store/pos-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Search } from "lucide-react";
import { createSale } from "@/app/actions/sale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";

type Family = { id: string; name: string };
type Product = { id: string; name: string; familyId: string; salePrice: number; purchasePrice?: number | null; active: boolean };

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function ManualItemDialog({ onAdd }: { onAdd: (name: string, price: number) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name || isNaN(p) || p <= 0) return;
    onAdd(name, p);
    setName("");
    setPrice("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error react 19 compatibility */}
      <DialogTrigger asChild>
        <Button variant="secondary" className="h-10">
          Añadir Varios
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Artículo Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre / Descripción</Label>
            <Input
              id="name"
              placeholder="Ej: Chuches"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 2.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Añadir al Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PosClient({
  families,
  products,
}: {
  families: Family[];
  products: Product[];
}) {
  const { cart, addItem, removeItem, updateQuantity, clearCart } =
    usePosStore();
  const [viewMode, setViewMode] = useState<"families" | "products">("families");
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const activeProducts = products.filter((p) => p.active);

  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFamily = selectedFamily ? p.familyId === selectedFamily : true;
    return matchesSearch && matchesFamily;
  });

  function handleCheckout() {
    if (cart.length === 0) return;

    startTransition(async () => {
      try {
        await createSale({
          total,
          items: cart.map((item) => ({
            productId: item.isManual ? undefined : item.productId,
            customName: item.isManual ? item.name : undefined,
            quantity: item.quantity,
            unitPrice: item.price,
            unitCost: item.purchasePrice || 0,
          })),
        });
        toast.success("Venta completada");
        clearCart();
      } catch (error) {
        toast.error("Error al procesar la venta");
      }
    });
  }

  const cartContent = (
    <>
      <div className="p-4 border-b flex items-center justify-between bg-muted/20">
        <h2 className="font-semibold text-lg">Ticket Actual</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          disabled={cart.length === 0}
          className="text-muted-foreground hover:text-destructive"
        >
          Limpiar
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">
              El ticket está vacío
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex flex-col gap-2">
                <div className="flex justify-between font-medium">
                  <span className="line-clamp-1 mr-2">{item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/10 space-y-4">
        <div className="flex items-center justify-between text-2xl font-bold">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
        <Button
          size="lg"
          className="w-full h-16 text-xl rounded-xl"
          disabled={cart.length === 0 || isPending}
          onClick={handleCheckout}
        >
          {isPending ? "Cobrando..." : "Cobrar"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex flex-1 overflow-hidden relative w-full">
      {/* Zona Izquierda: Productos y Familias */}
      <div className="flex-1 flex flex-col min-h-0 bg-muted/10 pb-20 md:pb-0">
        <div className="p-4 border-b bg-card flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar producto..."
              className="pl-8 h-10 text-lg bg-background"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setViewMode("products");
              }}
            />
          </div>
          <ManualItemDialog 
            onAdd={(name, price) => 
              addItem({ 
                id: "manual-" + Date.now(), 
                name, 
                salePrice: price, 
                purchasePrice: 0,
                isManual: true 
              })
            } 
          />
        </div>

        {/* Vista de Familias */}
        {viewMode === "families" && !searchQuery && (
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <button
                className="flex flex-col items-center justify-center p-4 h-32 border-2 border-primary/20 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors text-center shadow-sm active:scale-95"
                onClick={() => {
                  setSelectedFamily(null);
                  setViewMode("products");
                }}
              >
                <span className="font-bold text-xl text-primary">Todos los artículos</span>
              </button>
              {families.map((f) => (
                <button
                  key={f.id}
                  className="flex flex-col items-center justify-center p-4 h-32 border rounded-2xl bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-center shadow-sm active:scale-95"
                  onClick={() => {
                    setSelectedFamily(f.id);
                    setViewMode("products");
                  }}
                >
                  <span className="font-bold text-xl line-clamp-2 leading-tight">
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Vista de Productos */}
        {(viewMode === "products" || searchQuery) && (
          <div className="flex flex-col flex-1 min-h-0">
            {!searchQuery && (
              <div className="p-4 pb-0 flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("families")} 
                  className="rounded-full shadow-sm"
                >
                  &larr; Familias
                </Button>
                <h2 className="font-bold text-lg text-muted-foreground line-clamp-1">
                  {selectedFamily === null 
                    ? "Todos los artículos" 
                    : families.find(f => f.id === selectedFamily)?.name}
                </h2>
              </div>
            )}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No se encontraron artículos.
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      className="flex flex-col items-center justify-center p-4 h-28 border rounded-xl bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-center shadow-sm active:scale-95"
                      onClick={() => addItem({ ...p, purchasePrice: p.purchasePrice ?? undefined })}
                    >
                      <span className="font-semibold text-base line-clamp-2 leading-tight">
                        {p.name}
                      </span>
                      <span className="text-muted-foreground mt-2 font-medium">
                        {p.salePrice.toFixed(2)} €
                      </span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Botón flotante móvil para carrito */}
      <div className="md:hidden fixed bottom-4 right-4 left-4 z-50">
        <Sheet>
          {/* @ts-expect-error react 19 compatibility */}
          <SheetTrigger asChild>
            <div className={cn(buttonVariants({ size: "lg" }), "w-full h-16 rounded-full shadow-xl flex justify-between px-6 text-lg relative cursor-pointer")}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Ver Ticket</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground text-primary rounded-full px-3 py-1 text-sm font-bold">
                  {cart.length}
                </div>
                <span className="font-bold">{total.toFixed(2)} €</span>
              </div>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col rounded-t-2xl">
            <SheetHeader className="p-4 pb-0 text-left">
              <SheetTitle>Ticket Actual</SheetTitle>
            </SheetHeader>
            {cartContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Zona Derecha: Carrito (Desktop) */}
      <div className="hidden md:flex w-96 bg-card border-l flex-col shrink-0 h-full">
        {cartContent}
      </div>
    </div>
  );
}
