import { getProducts } from "@/app/actions/product";
import { PurchaseForm } from "./purchase-form";

export default async function NewPurchasePage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Registrar Compra</h1>
      </div>
      
      <div className="rounded-md border bg-card p-6">
        <PurchaseForm products={products} />
      </div>
    </div>
  );
}
