import { useQuery } from "@tanstack/react-query";
import { BrainCircuit, RefreshCw, Target } from "lucide-react";

import { dashboardApi } from "@/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const money = (value: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));

export function MhPredictionAccuracyPanel() {
  const query = useQuery({
    queryKey: ["dashboard", "mh-core", "evaluation", 12],
    queryFn: () => dashboardApi.getMhEvaluation(12),
    staleTime: 5 * 60_000,
  });

  if (query.isLoading) return <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl" />;

  if (query.isError || !query.data) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
          <BrainCircuit className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No fue posible consultar la precisión</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const data = query.data;
  if (!data.evaluations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Precisión de MH-Core</CardTitle>
          <CardDescription>Aún no hay predicciones con siete días completos para comparar.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">El historial aparecerá automáticamente conforme se acumulen resultados reales.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Precisión general</p>
            <p className="text-2xl font-semibold">{data.overall_accuracy_percent ?? 0}%</p>
          </div>
          <p className="text-sm text-muted-foreground">{data.evaluated_predictions} predicciones evaluadas</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {data.evaluations.map((item) => (
          <Card key={item.business_date}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Predicción del {item.business_date}</p>
                  <p className="text-xs text-muted-foreground">Periodo: {item.horizon.start} a {item.horizon.end}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{item.accuracy.overall_percent}%</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Visitantes</p>
                  <p>Previstos: <strong>{item.expected.visitors}</strong> · Reales: <strong>{item.actual.visitors}</strong></p>
                  <p className="mt-1 text-xs">Precisión: {item.accuracy.visitors_percent}%</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                  <p>Previstos: <strong>{money(item.expected.revenue)}</strong></p>
                  <p>Reales: <strong>{money(item.actual.revenue)}</strong></p>
                  <p className="mt-1 text-xs">Precisión: {item.accuracy.revenue_percent}%</p>
                </div>
              </div>
              <p className="text-xs capitalize text-muted-foreground">Confianza original: {item.original_confidence}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
