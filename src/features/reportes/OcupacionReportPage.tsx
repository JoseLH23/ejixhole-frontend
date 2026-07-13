import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportarCSVButton } from "@/components/shared/ExportarCSVButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useServicios } from "@/features/servicios/useServicios";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { useReporteOcupacion } from "./useReportes";
import type { OcupacionServicioItem } from "@/types/reporte";

const FILTRO_TODOS = "todos";

export function OcupacionReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [servicioId, setServicioId] = React.useState<string>(FILTRO_TODOS);

  const { data: servicios } = useServicios();

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteOcupacion({
    ...filtroFecha,
    servicio_id: servicioId === FILTRO_TODOS ? undefined : Number(servicioId),
  });

  const columnas: DataTableColumn<OcupacionServicioItem>[] = [
    { header: "Servicio", cell: (i) => i.servicio_nombre },
    { header: "Capacidad máxima", cell: (i) => i.capacidad_maxima ?? "—" },
    { header: "Reservaciones", cell: (i) => i.num_reservaciones },
    { header: "Personas totales", cell: (i) => i.total_personas },
    { header: "Promedio por reservación", cell: (i) => i.promedio_personas_por_reservacion },
    {
      header: "% Ocupación promedio",
      cell: (i) => (i.porcentaje_ocupacion_promedio !== null ? `${i.porcentaje_ocupacion_promedio}%` : "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
<div>
        <h1 className="font-display text-2xl font-semibold">Ocupación</h1>
        <p className="text-sm text-muted-foreground">
          Porcentaje promedio de ocupación por reservación (no acumulado — un servicio con capacidad
          10 que siempre reserva 5 muestra 50%, sin importar cuántas veces se repita).
        </p>
      </div>
        <ExportarCSVButton nombreArchivo="ocupacion" filas={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />
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

      {isLoading && <TableSkeleton columnas={6} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState titulo="Sin servicios activos" />
      )}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <DataTable columns={columnas} data={data.items} getRowId={(i) => i.servicio_id} />
      )}
    </div>
  );
}
