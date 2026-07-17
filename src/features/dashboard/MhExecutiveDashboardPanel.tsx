import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Brain, CalendarDays, CircleDollarSign, RefreshCw, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { dashboardApi } from "@/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/chartColors";

const money = (value: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));

export function MhExecutiveDashboardPanel() {
  const query = useQuery({
    queryKey: ["dashboard", "mh-core", 7],
    queryFn: () => dashboardApi.getMhExecutive(7),
    staleTime: 60_000,
  });

  if (query.isLoading) {
    return <div className="skeleton-shimmer h-72 animate-shimmer rounded-xl" />;
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
          <Brain className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold">MH-Core no está disponible</p>
            <p className="text-sm text-muted-foreground">El panel operativo sigue funcionando. Reintenta en unos segundos.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = query.data;
  const timeline = data.timeline.map((item) => ({ ...item, ingreso: Number(item.net_revenue) }));
  const kpis = [
    { label: "Ingreso neto", value: money(data.kpis.net_revenue), icon: CircleDollarSign },
    { label: "Reservaciones activas", value: data.kpis.active_reservations, icon: CalendarDays },
    { label: "Próximos visitantes", value: data.kpis.upcoming_people_7_days, icon: Users },
    { label: "Saldo pendiente", value: money(data.kpis.pending_balance), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4" /> Tendencia inteligente</CardTitle>
            <CardDescription>Ingresos netos y reservaciones de los últimos 7 días.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => money(String(value))} />
                  <Area type="monotone" dataKey="ingreso" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Recomendaciones de MH-Core</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.map((item) => <div key={item.code} className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">{item.message}</div>)}
            {data.recommendations.map((item) => <div key={item.code} className="rounded-lg border bg-muted/40 p-3 text-sm">{item.message}</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
