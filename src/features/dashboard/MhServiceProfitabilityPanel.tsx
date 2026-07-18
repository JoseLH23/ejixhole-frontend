import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, RefreshCw, TriangleAlert } from "lucide-react";

import { dashboardApi } from "@/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const money = (value: string | null) =>
  value == null
    ? "Pendiente"
    : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));

export function MhServiceProfitabilityPanel() {
  const query = useQuery({
    queryKey: ["dashboard", "mh-core", "profitability", 30],
    queryFn: () => dashboardApi.getMhProfitability(30),
    staleTime: 60_000,
  });

  if (query.isLoading) return <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl" />;
  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
          <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold">No fue posible cargar los ingresos por servicio</p>
            <p className="text-sm text-muted-foreground">La operación normal continúa disponible.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = query.data;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ingreso bruto</p><p className="mt-1 text-lg font-semibold">{money(data.totals.gross_revenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Reembolsos</p><p className="mt-1 text-lg font-semibold">{money(data.totals.refunds)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ingreso neto</p><p className="mt-1 text-lg font-semibold">{money(data.totals.net_revenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Visitas completadas</p><p className="mt-1 text-lg font-semibold">{data.totals.completed_visits}</p></CardContent></Card>
      </div>

      {data.cost_status !== "available" && (
        <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Los ingresos son reales. El margen todavía no se calcula porque faltan costos operativos por servicio.</p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Servicios ordenados por ingreso neto</CardTitle>
          <CardDescription>Periodo de {data.period.days} días. Vista de solo lectura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.services.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Todavía no hay ingresos asociados a servicios en este periodo.</p>
          ) : data.services.map((item) => (
            <div key={item.service_id} className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-5 sm:items-center">
              <div className="sm:col-span-2"><p className="font-medium">{item.service_name || `Servicio ${item.service_id}`}</p><p className="text-xs text-muted-foreground">{item.completed_visits} visitas completadas</p></div>
              <div><p className="text-xs text-muted-foreground">Ingreso neto</p><p className="font-semibold">{money(item.net_revenue)}</p></div>
              <div><p className="text-xs text-muted-foreground">Costos</p><p>{money(item.costs)}</p></div>
              <div><p className="text-xs text-muted-foreground">Margen</p><p>{money(item.margin)}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
