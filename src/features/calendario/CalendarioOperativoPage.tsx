import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProximaReservacionItem } from "@/types/reporte";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_VISIBLES = 4;

function claveFecha(fecha: Date) {
  return format(fecha, "yyyy-MM-dd");
}

export function CalendarioOperativoPage() {
  const hoy = startOfToday();
  const primerMes = startOfMonth(hoy);
  const ultimoMes = addMonths(primerMes, MESES_VISIBLES - 1);
  const [mesActual, setMesActual] = React.useState(primerMes);
  const [diaSeleccionado, setDiaSeleccionado] = React.useState(hoy);
  const { data, isLoading, isError, refetch } = useReporteProximasReservaciones({ dias: 125, estado: "confirmada" });

  const reservacionesPorDia = React.useMemo(() => {
    const mapa = new Map<string, ProximaReservacionItem[]>();
    for (const reservacion of data?.items ?? []) {
      mapa.set(reservacion.fecha_visita, [...(mapa.get(reservacion.fecha_visita) ?? []), reservacion]);
    }
    return mapa;
  }, [data]);

  const diasCalendario = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 }),
  });

  const reservacionesSeleccionadas = reservacionesPorDia.get(claveFecha(diaSeleccionado)) ?? [];
  const visitantesSeleccionados = reservacionesSeleccionadas.reduce((total, item) => total + item.num_personas, 0);
  const puedeRetroceder = mesActual.getTime() > primerMes.getTime();
  const puedeAvanzar = mesActual.getTime() < ultimoMes.getTime();

  function cambiarMes(direccion: -1 | 1) {
    const siguiente = direccion === 1 ? addMonths(mesActual, 1) : subMonths(mesActual, 1);
    if (siguiente < primerMes || siguiente > ultimoMes) return;
    setMesActual(siguiente);
    setDiaSeleccionado(siguiente);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Operación</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">Calendario operativo</h1>
          <p className="text-sm text-muted-foreground">Reservaciones confirmadas de los próximos cuatro meses. Vista de solo lectura.</p>
        </div>
        <Link to="/reservaciones" className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Administrar reservaciones
        </Link>
      </div>

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No se pudo cargar el calendario</p>
              <p className="text-sm text-muted-foreground">Reintenta para consultar las reservaciones confirmadas.</p>
            </div>
            <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Reintentar</button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="capitalize">{format(mesActual, "MMMM yyyy", { locale: es })}</CardTitle>
                <CardDescription>Selecciona un día para revisar su operación.</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => cambiarMes(-1)} disabled={!puedeRetroceder} aria-label="Mes anterior" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => cambiarMes(1)} disabled={!puedeAvanzar} aria-label="Mes siguiente" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-b border-border pb-2">
                {DIAS_SEMANA.map((dia) => <span key={dia} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{dia}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {diasCalendario.map((dia) => {
                  const reservaciones = reservacionesPorDia.get(claveFecha(dia)) ?? [];
                  const visitantes = reservaciones.reduce((total, item) => total + item.num_personas, 0);
                  const seleccionado = isSameDay(dia, diaSeleccionado);
                  const fueraDelMes = !isSameMonth(dia, mesActual);
                  const pasado = dia < hoy;

                  return (
                    <button
                      key={dia.toISOString()}
                      type="button"
                      onClick={() => !pasado && setDiaSeleccionado(dia)}
                      disabled={pasado}
                      className={cn(
                        "min-h-20 rounded-xl border p-2 text-left transition-all sm:min-h-24",
                        fueraDelMes ? "border-transparent bg-muted/20 text-muted-foreground/50" : "border-border bg-card",
                        !pasado && "hover:border-primary/40 hover:bg-primary/[0.03]",
                        seleccionado && "border-primary bg-primary/5 ring-1 ring-primary/20",
                        pasado && "cursor-not-allowed opacity-45"
                      )}
                    >
                      <span className={cn("text-xs font-semibold", isSameDay(dia, hoy) && "rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground")}>{format(dia, "d")}</span>
                      {isLoading ? (
                        <div className="mt-3 h-2 w-8 animate-pulse rounded bg-muted" />
                      ) : reservaciones.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] font-semibold text-primary">{reservaciones.length} {reservaciones.length === 1 ? "reserva" : "reservas"}</p>
                          <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Users className="h-3 w-3" /> {visitantes}</p>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="capitalize">{format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}</CardTitle>
              <CardDescription>
                {reservacionesSeleccionadas.length > 0 ? `${reservacionesSeleccionadas.length} reservaciones · ${visitantesSeleccionados} visitantes` : "Sin reservaciones confirmadas para este día."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reservacionesSeleccionadas.map((item) => (
                <div key={item.reservacion_id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.servicio_nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.cliente_nombre}</p>
                    </div>
                    <EstadoBadge estado={item.estado} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{item.num_personas} {item.num_personas === 1 ? "persona" : "personas"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
