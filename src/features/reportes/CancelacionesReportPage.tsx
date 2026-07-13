import * as React from "react";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportarCSVButton } from "@/components/shared/ExportarCSVButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { ResumenStats } from "./ResumenStats";
import { useReporteCancelaciones } from "./useReportes";
import type { CancelacionPorServicioItem } from "@/types/reporte";

export function CancelacionesReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteCancelaciones(filtroFecha);

  const columnas: DataTableColumn<CancelacionPorServicioItem>[] = [
    { header: "Servicio", cell: (i) => i.servicio_nombre },
    { header: "Cancelaciones", cell: (i) => i.num_cancelaciones },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
<div>
        <h1 className="font-display text-2xl font-semibold">Cancelaciones</h1>
        <p className="text-sm text-muted-foreground">
          Tasa de cancelación del periodo y desglose por servicio.
        </p>
      </div>
        <ExportarCSVButton nombreArchivo="cancelaciones" filas={(data?.desglose_por_servicio ?? []) as unknown as Record<string, unknown>[]} />
      </div>

      <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />

      {isLoading && <TableSkeleton columnas={2} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats
            items={[
              { label: "Total reservaciones", value: data.total_reservaciones },
              { label: "Canceladas", value: data.num_canceladas },
              { label: "Tasa de cancelación", value: `${data.tasa_cancelacion}%` },
            ]}
          />
          {data.desglose_por_servicio.length === 0 ? (
            <EmptyState titulo="Sin cancelaciones en este rango" />
          ) : (
            <DataTable columns={columnas} data={data.desglose_por_servicio} getRowId={(i) => i.servicio_id} />
          )}
        </>
      )}
    </div>
  );
}
