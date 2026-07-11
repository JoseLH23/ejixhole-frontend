import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ESTADOS_RESERVACION } from "@/types/reservacion";
import { CHART_COLORS } from "@/lib/chartColors";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { ResumenStats } from "./ResumenStats";
import { SerieLineChart } from "./SerieLineChart";
import { useReporteTendenciaReservaciones } from "./useReportes";
import type { AgruparPorFecha } from "@/types/reporte";

const FILTRO_TODOS = "todos";

export function TendenciaReservacionesReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [agruparPor, setAgruparPor] = React.useState<AgruparPorFecha>("dia");
  const [estado, setEstado] = React.useState<string>(FILTRO_TODOS);

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteTendenciaReservaciones({
    ...filtroFecha,
    agrupar_por: agruparPor,
    estado: estado === FILTRO_TODOS ? undefined : estado,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Tendencia de reservaciones</h1>
        <p className="text-sm text-muted-foreground">Número de reservaciones creadas por periodo.</p>
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

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {ESTADOS_RESERVACION.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
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
          <ResumenStats items={[{ label: "Total", value: data.total }]} />
          {data.serie.length === 0 ? (
            <EmptyState titulo="Sin reservaciones en este rango" />
          ) : (
            <SerieLineChart
              data={data.serie.map((item) => ({ periodo: item.periodo, num_reservaciones: item.num_reservaciones }))}
              xKey="periodo"
              lines={[{ dataKey: "num_reservaciones", name: "Reservaciones", color: CHART_COLORS.primary }]}
            />
          )}
        </>
      )}
    </div>
  );
}
