import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatearMoneda } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chartColors";
import { useServicios } from "@/features/servicios/useServicios";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { ResumenStats } from "./ResumenStats";
import { SerieLineChart } from "./SerieLineChart";
import { useReporteIngresos } from "./useReportes";
import type { AgruparPorIngresos } from "@/types/reporte";

const FILTRO_TODOS = "todos";
const AGRUPACIONES: { value: AgruparPorIngresos; label: string }[] = [
  { value: "dia", label: "Por día" },
  { value: "semana", label: "Por semana" },
  { value: "mes", label: "Por mes" },
  { value: "metodo_pago", label: "Por método de pago" },
];
const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia", "otro"];

export function IngresosReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [agruparPor, setAgruparPor] = React.useState<AgruparPorIngresos>("dia");
  const [metodoPago, setMetodoPago] = React.useState<string>(FILTRO_TODOS);
  const [servicioId, setServicioId] = React.useState<string>(FILTRO_TODOS);

  const { data: servicios } = useServicios();

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteIngresos({
    ...filtroFecha,
    agrupar_por: agruparPor,
    metodo_pago: metodoPago === FILTRO_TODOS ? undefined : metodoPago,
    servicio_id: servicioId === FILTRO_TODOS ? undefined : Number(servicioId),
  });

  const serieNumerica = (data?.serie ?? []).map((item) => ({
    periodo: item.periodo,
    ingresos: Number(item.ingresos),
    reembolsos: Number(item.reembolsos),
    neto: Number(item.neto),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ingresos</h1>
        <p className="text-sm text-muted-foreground">Ingresos, reembolsos y neto por periodo.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Agrupar por</label>
          <Select value={agruparPor} onValueChange={(v) => setAgruparPor(v as AgruparPorIngresos)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGRUPACIONES.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Método de pago</label>
          <Select value={metodoPago} onValueChange={setMetodoPago}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {METODOS_PAGO.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Servicio</label>
          <Select value={servicioId} onValueChange={setServicioId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {servicios?.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="h-72 animate-pulse rounded-lg border bg-muted" />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats
            items={[
              { label: "Ingresos totales", value: formatearMoneda(data.total_ingresos) },
              { label: "Reembolsos", value: formatearMoneda(data.total_reembolsos) },
              { label: "Neto", value: formatearMoneda(data.total_neto) },
              { label: "# de pagos", value: data.num_pagos },
            ]}
          />

          {serieNumerica.length === 0 ? (
            <EmptyState titulo="Sin pagos en este rango" />
          ) : agruparPor === "metodo_pago" ? (
            <SerieLineChart
              data={serieNumerica}
              xKey="periodo"
              lines={[{ dataKey: "neto", name: "Neto por método", color: CHART_COLORS.primary }]}
            />
          ) : (
            <SerieLineChart
              data={serieNumerica}
              xKey="periodo"
              lines={[
                { dataKey: "ingresos", name: "Ingresos", color: CHART_COLORS.primary },
                { dataKey: "reembolsos", name: "Reembolsos", color: CHART_COLORS.destructive },
                { dataKey: "neto", name: "Neto", color: CHART_COLORS.wood },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
}
