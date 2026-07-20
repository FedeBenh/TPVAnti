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
import { createFamily, updateFamily } from "@/app/actions/family";
import { toast } from "sonner";
import { Plus, Image as ImageIcon } from "lucide-react";

export function FamilyDialog({
  family,
}: {
  family?: { id: string; name: string; order: number; image?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageBase64, setImageBase64] = useState<string | null>(family?.image || null);
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
    const order = parseInt(formData.get("order") as string, 10);

    startTransition(async () => {
      try {
        if (family) {
          await updateFamily(family.id, { name, order, image: imageBase64 });
          toast.success("Familia actualizada");
        } else {
          await createFamily({ name, order, image: imageBase64 });
          toast.success("Familia creada");
        }
        setOpen(false);
      } catch (error) {
        toast.error("Error al guardar la familia");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setImageBase64(family?.image || null);
    }}>
      {/* @ts-expect-error react 19 compatibility */}
      <DialogTrigger asChild>
        {family ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Familia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {family ? "Editar Familia" : "Nueva Familia"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
          <div className="grid gap-4 py-4">
            
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
                defaultValue={family?.name}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={family?.order ?? 0}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
