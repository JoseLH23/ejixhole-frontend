import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { CHART_COLORS } from "@/lib/chartColors";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { ResumenStats } from "./ResumenStats";
import { SerieLineChart } from "./SerieLineChart";
import { useReporteClientesNuevos } from "./useReportes";
import type { AgruparPorFecha } from "@/types/reporte";

export function ClientesNuevosReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [agruparPor, setAgruparPor] = React.useState<AgruparPorFecha>("dia");

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteClientesNuevos({
    ...filtroFecha,
    agrupar_por: agruparPor,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Clientes nuevos</h1>
        <p className="text-sm text-muted-foreground">Clientes registrados por periodo.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Agrupar por</label>
          <Select value={agruparPor} onValueChange={(v) => setAgruparPor(v as AgruparPorFecha)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Día</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="h-72 animate-pulse rounded-lg border bg-muted" />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats items={[{ label: "Total", value: data.total }]} />
          {data.serie.length === 0 ? (
            <EmptyState titulo="Sin clientes nuevos en este rango" />
          ) : (
            <SerieLineChart
              data={data.serie.map((item) => ({ periodo: item.periodo, num_clientes: item.num_clientes }))}
              xKey="periodo"
              lines={[{ dataKey: "num_clientes", name: "Clientes nuevos", color: CHART_COLORS.wood }]}
            />
          )}
        </>
      )}
    </div>
  );
}
