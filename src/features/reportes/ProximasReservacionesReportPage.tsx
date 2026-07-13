import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstadoBadge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportarCSVButton } from "@/components/shared/ExportarCSVButton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ESTADOS_RESERVACION } from "@/types/reservacion";
import { ResumenStats } from "./ResumenStats";
import { useReporteProximasReservaciones } from "./useReportes";
import type { ProximaReservacionItem } from "@/types/reporte";

export function ProximasReservacionesReportPage() {
  const [dias, setDias] = React.useState("7");
  const [estado, setEstado] = React.useState("confirmada");

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteProximasReservaciones({
    dias: dias ? Number(dias) : undefined,
    estado,
  });

  const columnas: DataTableColumn<ProximaReservacionItem>[] = [
    { header: "Cliente", cell: (i) => i.cliente_nombre },
    { header: "Servicio", cell: (i) => i.servicio_nombre },
    { header: "Fecha visita", cell: (i) => i.fecha_visita },
    { header: "Personas", cell: (i) => i.num_personas },
    { header: "Estado", cell: (i) => <EstadoBadge estado={i.estado} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
<div>
        <h1 className="font-display text-2xl font-semibold">Próximas reservaciones</h1>
        <p className="text-sm text-muted-foreground">
          Reservaciones con fecha de visita próxima. No filtra por periodo — siempre parte de hoy.
        </p>
      </div>
        <ExportarCSVButton nombreArchivo="proximas-reservaciones" filas={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-28 space-y-1">
          <Label htmlFor="dias">Días</Label>
          <Input id="dias" inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_RESERVACION.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <TableSkeleton columnas={5} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats items={[{ label: "Total", value: data.total }]} />
          {data.items.length === 0 ? (
            <EmptyState
              titulo="Sin reservaciones próximas"
              descripcion="No hay ninguna en ese rango de días con ese estado."
            />
          ) : (
            <DataTable columns={columnas} data={data.items} getRowId={(i) => i.reservacion_id} />
          )}
        </>
      )}
    </div>
  );
}
