"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/actions/product";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      startTransition(async () => {
        try {
          await deleteProduct(id);
          toast.success("Artículo eliminado");
        } catch (error) {
          toast.error("Error al eliminar el artículo.");
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
