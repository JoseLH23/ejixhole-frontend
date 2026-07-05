import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatearMoneda } from "@/lib/format";
import { useClientes } from "@/features/clientes/useClientes";
import { useServicios } from "@/features/servicios/useServicios";
import { ResumenStats } from "./ResumenStats";
import { useReporteCuentasPorCobrar } from "./useReportes";
import type { CuentaPorCobrarItem } from "@/types/reporte";

export function CuentasPorCobrarReportPage() {
  const [antiguedadMinima, setAntiguedadMinima] = React.useState("");

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteCuentasPorCobrar({
    antiguedad_minima_dias: antiguedadMinima ? Number(antiguedadMinima) : undefined,
  });

  // CuentaPorCobrarItem solo trae IDs — se resuelven nombres
  // reutilizando los hooks ya existentes de Clientes/Servicios.
  const { data: clientes } = useClientes({ solo_activos: false, limit: 200 });
  const { data: servicios } = useServicios({ solo_activos: false, limit: 200 });

  const columnas: DataTableColumn<CuentaPorCobrarItem>[] = [
    {
      header: "Cliente",
      cell: (i) => clientes?.find((c) => c.id === i.cliente_id)?.nombre ?? `#${i.cliente_id}`,
    },
    {
      header: "Servicio",
      cell: (i) => servicios?.find((s) => s.id === i.servicio_id)?.nombre ?? `#${i.servicio_id}`,
    },
    { header: "Fecha visita", cell: (i) => i.fecha_visita },
    { header: "Antigüedad", cell: (i) => `${i.antiguedad_dias} días` },
    {
      header: "Saldo pendiente",
      cell: (i) => <span className="font-mono">{formatearMoneda(i.saldo_pendiente)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Cuentas por cobrar</h1>
        <p className="text-sm text-muted-foreground">
          Reservaciones activas con saldo pendiente, ordenadas de más antigua a más reciente. Es un
          snapshot del momento — no filtra por fecha.
        </p>
      </div>

      <div className="max-w-[220px] space-y-1">
        <Label htmlFor="antiguedad">Antigüedad mínima (días)</Label>
        <Input
          id="antiguedad"
          inputMode="numeric"
          placeholder="Ej. 15"
          value={antiguedadMinima}
          onChange={(e) => setAntiguedadMinima(e.target.value)}
        />
      </div>

      {isLoading && <TableSkeleton columnas={5} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats
            items={[
              { label: "Reservaciones", value: data.num_reservaciones },
              { label: "Total pendiente", value: formatearMoneda(data.total_pendiente) },
            ]}
          />
          {data.items.length === 0 ? (
            <EmptyState titulo="Sin cuentas por cobrar" descripcion="No hay saldos pendientes con este filtro." />
          ) : (
            <DataTable columns={columnas} data={data.items} getRowId={(i) => i.reservacion_id} />
          )}
        </>
      )}
    </div>
  );
}
