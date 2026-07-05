import { getFamilies } from "@/app/actions/family";
import { FamilyDialog } from "./family-dialog";
import { DeleteFamilyButton } from "./delete-family-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FamiliesPage() {
  const families = await getFamilies();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Familias</h1>
        <FamilyDialog />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[100px]">Orden</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No hay familias registradas.
                </TableCell>
              </TableRow>
            )}
            {families.map((family) => (
              <TableRow key={family.id}>
                <TableCell className="font-medium">{family.name}</TableCell>
                <TableCell>{family.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <FamilyDialog family={family} />
                    <DeleteFamilyButton id={family.id} />
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
