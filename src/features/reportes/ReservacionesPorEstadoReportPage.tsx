import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useServicios } from "@/features/servicios/useServicios";
import { ORIGENES_RESERVACION } from "@/types/reservacion";
import { PeriodoFilter, type PeriodoFiltroValue } from "./PeriodoFilter";
import { ResumenStats } from "./ResumenStats";
import { useReporteReservacionesPorEstado } from "./useReportes";

const FILTRO_TODOS = "todos";

const COLOR_ESTADO: Record<string, string> = {
  pendiente: "#D4A24C",
  confirmada: "#3B6FA0",
  completada: "#5B8C5A",
  cancelada: "#B5533C",
};

export function ReservacionesPorEstadoReportPage() {
  const [filtroFecha, setFiltroFecha] = React.useState<PeriodoFiltroValue>({ periodo: "mes" });
  const [servicioId, setServicioId] = React.useState<string>(FILTRO_TODOS);
  const [origen, setOrigen] = React.useState<string>(FILTRO_TODOS);

  const { data: servicios } = useServicios();

  const { data, isLoading, isError, error, refetch, isFetching } = useReporteReservacionesPorEstado({
    ...filtroFecha,
    servicio_id: servicioId === FILTRO_TODOS ? undefined : Number(servicioId),
    origen: origen === FILTRO_TODOS ? undefined : origen,
  });

  const datosGrafica = data
    ? Object.entries(data.por_estado).map(([estado, cantidad]) => ({ estado, cantidad }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reservaciones por estado</h1>
        <p className="text-sm text-muted-foreground">
          Conteo de reservaciones creadas en el periodo, por estado.
        </p>
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

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Origen</label>
          <Select value={origen} onValueChange={setOrigen}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {ORIGENES_RESERVACION.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="h-64 animate-pulse rounded-lg border bg-muted" />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}

      {!isLoading && !isError && data && (
        <>
          <ResumenStats items={[{ label: "Total", value: data.total }]} />
          {data.total === 0 ? (
            <EmptyState titulo="Sin reservaciones en este rango" />
          ) : (
            <div className="h-64 w-full rounded-lg border border-border p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    {datosGrafica.map((d) => (
                      <Cell key={d.estado} fill={COLOR_ESTADO[d.estado] ?? "#0D7480"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
