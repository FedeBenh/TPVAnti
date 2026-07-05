"use client";

import { useState, useTransition } from "react";
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
import { Plus } from "lucide-react";

export function FamilyDialog({
  family,
}: {
  family?: { id: string; name: string; order: number };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    const order = parseInt(formData.get("order") as string, 10);

    startTransition(async () => {
      try {
        if (family) {
          await updateFamily(family.id, { name, order });
          toast.success("Familia actualizada");
        } else {
          await createFamily({ name, order });
          toast.success("Familia creada");
        }
        setOpen(false);
      } catch (error) {
        toast.error("Error al guardar la familia");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
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
