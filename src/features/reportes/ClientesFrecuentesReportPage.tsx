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
import { useReporteClientesFrecuentes } from "./useReportes";
import type { ClienteFrecuenteItem } from "@/types/reporte";

export function ClientesFrecuentesReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [limit, setLimit] = React.useState("10");
  const [minimoReservaciones, setMinimoReservaciones] = React.useState("2");

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteClientesFrecuentes({
    ...filtroFecha,
    limit: limit ? Number(limit) : undefined,
    minimo_reservaciones: minimoReservaciones ? Number(minimoReservaciones) : undefined,
  });

  const columnas: DataTableColumn<ClienteFrecuenteItem>[] = [
    { header: "Cliente", cell: (i) => i.cliente_nombre },
    { header: "Reservaciones", cell: (i) => i.num_reservaciones },
    {
      header: "Total gastado",
      cell: (i) => <span className="font-mono">{formatearMoneda(i.total_gastado)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
<div>
        <h1 className="font-display text-2xl font-semibold">Clientes frecuentes</h1>
        <p className="text-sm text-muted-foreground">
          Clientes con más reservaciones en el periodo (excluye canceladas).
        </p>
      </div>
        <ExportarCSVButton nombreArchivo="clientes-frecuentes" filas={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <PeriodoFilter value={filtroFecha} onChange={setFiltroFecha} />
        <div className="w-28 space-y-1">
          <Label htmlFor="limit">Top</Label>
          <Input id="limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div className="w-36 space-y-1">
          <Label htmlFor="minimo">Mín. reservaciones</Label>
          <Input
            id="minimo"
            inputMode="numeric"
            value={minimoReservaciones}
            onChange={(e) => setMinimoReservaciones(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <TableSkeleton columnas={3} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          titulo="Sin clientes frecuentes"
          descripcion="Nadie alcanza el mínimo de reservaciones en este rango."
        />
      )}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <DataTable columns={columnas} data={data.items} getRowId={(i) => i.cliente_id} />
      )}
    </div>
  );
}
