import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BrainCircuit, CalendarClock, CircleDollarSign, RefreshCw, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { dashboardApi } from "@/api/dashboard";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MhPredictions } from "@/types/mhPredictions";

type ExtendedPredictions = MhPredictions & {
  confidence_details?: { evaluated_predictions: number; historical_accuracy_percent: number | null; trend: string; warning: string | null };
  alerts?: Array<{ code: string; severity: string; message: string }>;
  daily_summary?: { title: string; message: string; alerts_count: number };
  context_factors?: { model_version: string; weekday: string; historical_events: number; seasonality: string; weather: { message: string } };
};

const money = (value: string) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));
const nivelClase = (nivel: string) => cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", nivel === "alto" && "bg-destructive/10 text-destructive", nivel === "medio" && "bg-warning/10 text-warning", nivel === "bajo" && "bg-success/10 text-success");
const confianza = (value: string) => value === "low" ? "Baja" : value === "medium" ? "Media" : "Alta";
const tendencia = (value?: string) => value === "improving" ? "Mejorando" : value === "declining" ? "Empeorando" : value === "stable" ? "Estable" : "Datos insuficientes";

export function MhPredictionsPanel() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["dashboard", "mh-core", "predictions", 7], queryFn: () => dashboardApi.getMhPredictions(7), staleTime: 60_000 });
  const decision = useMutation({
    mutationFn: ({ businessDate, code, value }: { businessDate: string; code: string; value: string }) => apiClient.post(`/dashboard/mh-core/predictions/recommendations/${code}/decision`, null, { params: { business_date: businessDate, decision: value } }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["dashboard", "mh-core", "predictions"] }),
  });

  if (query.isLoading) return <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl" />;
  if (query.isError || !query.data) return <Card><CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center"><BrainCircuit className="h-8 w-8 text-muted-foreground" /><div><p className="font-semibold">No fue posible calcular las predicciones</p><p className="text-sm text-muted-foreground">La operación normal sigue disponible. Intenta nuevamente.</p></div><Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className="mr-2 h-4 w-4" /> Reintentar</Button></CardContent></Card>;

  const data = query.data as ExtendedPredictions;
  const details = data.confidence_details;
  const items = [
    { label: "Visitantes estimados", value: data.predictions.expected_visitors_7_days, icon: Users },
    { label: "Ingresos esperados", value: money(data.predictions.expected_revenue_7_days), icon: CircleDollarSign },
    { label: "Reservaciones próximas", value: data.predictions.upcoming_reservations_7_days, icon: CalendarClock },
    { label: "Confianza calibrada", value: confianza(data.confidence), icon: ShieldCheck },
  ];

  return <div className="space-y-3">
    {data.daily_summary && <Card className="border-primary/20 bg-primary/5"><CardHeader className="pb-2"><CardTitle className="text-base">{data.daily_summary.title}</CardTitle><CardDescription>{data.daily_summary.message}</CardDescription></CardHeader></Card>}
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div><Icon className="h-5 w-5 text-primary" /></CardContent></Card>)}</div>
    {details && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" /> Confianza y aprendizaje</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm sm:grid-cols-3"><div>Evaluaciones: <strong>{details.evaluated_predictions}</strong></div><div>Precisión histórica: <strong>{details.historical_accuracy_percent == null ? "Pendiente" : `${details.historical_accuracy_percent}%`}</strong></div><div>Tendencia: <strong>{tendencia(details.trend)}</strong></div>{details.warning && <p className="sm:col-span-3 rounded-lg bg-warning/10 p-3 text-warning">{details.warning}</p>}</CardContent></Card>}
    {(data.alerts?.length ?? 0) > 0 && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4" /> Alertas inteligentes</CardTitle></CardHeader><CardContent className="space-y-2">{data.alerts?.map((item) => <div key={item.code} className="rounded-lg border p-3 text-sm">{item.message}</div>)}</CardContent></Card>}
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2"><Card><CardHeader className="pb-2"><CardTitle className="text-base">Actividad prevista</CardTitle><CardDescription>Modelo {data.context_factors?.model_version ?? "v1"} para los próximos 7 días.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Nivel de actividad</span><span className={nivelClase(data.predictions.activity_level)}>{data.predictions.activity_level}</span></div><div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Riesgo de cancelación</span><span className={nivelClase(data.predictions.cancellation_risk)}>{data.predictions.cancellation_risk}</span></div>{data.context_factors && <p className="text-xs text-muted-foreground">Día: {data.context_factors.weekday} · Eventos: {data.context_factors.historical_events} · Estacionalidad: {data.context_factors.seasonality}. {data.context_factors.weather.message}</p>}</CardContent></Card>
    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Recomendaciones medibles</CardTitle></CardHeader><CardContent className="space-y-2">{data.recommendations.map((item) => <div key={item.code} className="rounded-lg border bg-muted/40 p-3 text-sm"><p>{item.message}</p><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={decision.isPending} onClick={() => decision.mutate({ businessDate: data.business_date, code: item.code, value: "accepted" })}>Aplicar</Button><Button size="sm" variant="ghost" disabled={decision.isPending} onClick={() => decision.mutate({ businessDate: data.business_date, code: item.code, value: "dismissed" })}>Descartar</Button>{item.decision && <span className="self-center text-xs text-muted-foreground">Estado: {item.decision.decision}</span>}</div></div>)}</CardContent></Card></div>
  </div>;
}
