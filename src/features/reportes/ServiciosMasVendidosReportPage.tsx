import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportarCSVButton } from "@/components/shared/ExportarCSVButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatearMoneda } from "@/lib/format";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { useReporteServiciosMasVendidos } from "./useReportes";
import type { ServicioMasVendidoItem } from "@/types/reporte";

export function ServiciosMasVendidosReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [limit, setLimit] = React.useState("10");

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteServiciosMasVendidos({
    ...filtroFecha,
    limit: limit ? Number(limit) : undefined,
  });

  const columnas: DataTableColumn<ServicioMasVendidoItem>[] = [
    { header: "Servicio", cell: (i) => i.servicio_nombre },
    { header: "Reservaciones", cell: (i) => i.num_reservaciones },
    {
      header: "Total facturado",
      cell: (i) => <span className="font-mono">{formatearMoneda(i.total_facturado)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
<div>
        <h1 className="font-display text-2xl font-semibold">Servicios más vendidos</h1>
        <p className="text-sm text-muted-foreground">
          Ranking por número de reservaciones (excluye canceladas).
        </p>
      </div>
        <ExportarCSVButton nombreArchivo="servicios-mas-vendidos" filas={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />
        <div className="w-28 space-y-1">
          <Label htmlFor="limit">Top</Label>
          <Input id="limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
      </div>

      {isLoading && <TableSkeleton columnas={3} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState titulo="Sin ventas en este rango" />
      )}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <DataTable columns={columnas} data={data.items} getRowId={(i) => i.servicio_id} />
      )}
    </div>
  );
}
