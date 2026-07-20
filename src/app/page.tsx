export const dynamic = "force-dynamic";
import { getDashboardStats } from "@/app/actions/sale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ReceiptText, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportButtons } from "@/components/report-buttons";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ReportButtons />
          <Link href="/pos">
            <Button size="lg" className="h-12 px-8 text-lg rounded-xl">
              Abrir TPV
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salesTodayTotal.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Total facturado hoy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salesMonthTotal.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Facturación en el mes actual
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poco Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Artículos con stock ≤ 10
            </p>
          </CardContent>
        </Card>
        <Card className={stats.outOfStockProducts.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <AlertTriangle className={stats.outOfStockProducts.length > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Artículos agotados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay ventas recientes</p>
              ) : (
                stats.recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {sale.id.split('-')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sale.createdAt), "dd MMM HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="font-medium">
                      {sale.total.toFixed(2)} €
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.outOfStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <Badge variant="destructive">Agotado</Badge>
                </div>
              ))}
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <Badge variant="outline">Quedan {p.stock}</Badge>
                </div>
              ))}
              {stats.outOfStockProducts.length === 0 && stats.lowStockProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Inventario en buen estado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

