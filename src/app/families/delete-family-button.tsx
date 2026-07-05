"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteFamily } from "@/app/actions/family";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteFamilyButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("¿Estás seguro de que quieres eliminar esta familia? Los productos asociados podrían quedar huérfanos.")) {
      startTransition(async () => {
        try {
          await deleteFamily(id);
          toast.success("Familia eliminada");
        } catch (error) {
          toast.error("Error al eliminar. Asegúrate de que no tenga productos.");
        }
      });
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
