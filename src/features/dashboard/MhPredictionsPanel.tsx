import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BrainCircuit, CalendarClock, CircleDollarSign, RefreshCw, ShieldCheck, Users } from "lucide-react";

import { dashboardApi } from "@/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const money = (value: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));

const nivelClase = (nivel: string) =>
  cn(
    "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
    nivel === "alto" && "bg-destructive/10 text-destructive",
    nivel === "medio" && "bg-warning/10 text-warning",
    nivel === "bajo" && "bg-success/10 text-success"
  );

export function MhPredictionsPanel() {
  const query = useQuery({
    queryKey: ["dashboard", "mh-core", "predictions", 7],
    queryFn: () => dashboardApi.getMhPredictions(7),
    staleTime: 60_000,
  });

  if (query.isLoading) return <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl" />;

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
          <BrainCircuit className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold">No fue posible calcular las predicciones</p>
            <p className="text-sm text-muted-foreground">La operación normal sigue disponible. Intenta nuevamente.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = query.data;
  const items = [
    { label: "Visitantes estimados", value: data.predictions.expected_visitors_7_days, icon: Users },
    { label: "Ingresos esperados", value: money(data.predictions.expected_revenue_7_days), icon: CircleDollarSign },
    { label: "Reservaciones próximas", value: data.predictions.upcoming_reservations_7_days, icon: CalendarClock },
    { label: "Confianza", value: data.confidence === "low" ? "Baja" : data.confidence === "medium" ? "Media" : "Alta", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>
              <Icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actividad prevista</CardTitle>
            <CardDescription>Estimación orientativa para los próximos 7 días.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Nivel de actividad</span>
              <span className={nivelClase(data.predictions.activity_level)}>{data.predictions.activity_level}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Riesgo de cancelación</span>
              <span className={nivelClase(data.predictions.cancellation_risk)}>{data.predictions.cancellation_risk}</span>
            </div>
            {data.explanations.map((text) => <p key={text} className="text-xs leading-relaxed text-muted-foreground">• {text}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4" /> Preparación recomendada</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recommendations.map((item) => (
              <div key={item.code} className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p>{item.message}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">Prioridad: {item.priority}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
