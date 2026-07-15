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
import {
  Ban,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Plus,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ProximaReservacionItem } from "@/types/reporte";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";
import {
  cargarEventosCalendario,
  guardarEventosCalendario,
  type EventoCalendarioLocal,
  type TipoEventoCalendario,
} from "./calendarioLocal";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_VISIBLES = 4;

const TIPO_EVENTO: Record<
  TipoEventoCalendario,
  { etiqueta: string; icono: typeof Ban; clase: string; punto: string }
> = {
  bloqueo: { etiqueta: "Bloqueo operativo", icono: Ban, clase: "bg-destructive/10 text-destructive", punto: "bg-destructive" },
  mantenimiento: { etiqueta: "Mantenimiento", icono: Wrench, clase: "bg-warning/10 text-warning", punto: "bg-warning" },
  recordatorio: { etiqueta: "Recordatorio", icono: Bell, clase: "bg-primary/10 text-primary", punto: "bg-primary" },
  campana: { etiqueta: "Campaña", icono: Megaphone, clase: "bg-secondary/10 text-secondary", punto: "bg-secondary" },
};

function claveFecha(fecha: Date) {
  return format(fecha, "yyyy-MM-dd");
}

function crearIdEvento() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CalendarioOperativoPage() {
  const { usuario } = useAuth();
  const hoy = startOfToday();
  const primerMes = startOfMonth(hoy);
  const ultimoMes = addMonths(primerMes, MESES_VISIBLES - 1);
  const scopeUsuario = usuario?.email?.toLowerCase() || "usuario";
  const [mesActual, setMesActual] = React.useState(primerMes);
  const [diaSeleccionado, setDiaSeleccionado] = React.useState(hoy);
  const [formularioAbierto, setFormularioAbierto] = React.useState(false);
  const [eventos, setEventos] = React.useState<EventoCalendarioLocal[]>(() =>
    cargarEventosCalendario(scopeUsuario)
  );
  const [titulo, setTitulo] = React.useState("");
  const [tipo, setTipo] = React.useState<TipoEventoCalendario>("recordatorio");
  const [fechaInicio, setFechaInicio] = React.useState(claveFecha(hoy));
  const [fechaFin, setFechaFin] = React.useState(claveFecha(hoy));
  const [notas, setNotas] = React.useState("");
  const [errorFormulario, setErrorFormulario] = React.useState("");
  const { data, isLoading, isError, refetch } = useReporteProximasReservaciones({ dias: 125, estado: "confirmada" });

  React.useEffect(() => {
    setEventos(cargarEventosCalendario(scopeUsuario));
  }, [scopeUsuario]);

  React.useEffect(() => {
    guardarEventosCalendario(scopeUsuario, eventos);
  }, [eventos, scopeUsuario]);

  const reservacionesPorDia = React.useMemo(() => {
    const mapa = new Map<string, ProximaReservacionItem[]>();
    for (const reservacion of data?.items ?? []) {
      mapa.set(reservacion.fecha_visita, [...(mapa.get(reservacion.fecha_visita) ?? []), reservacion]);
    }
    return mapa;
  }, [data]);

  const eventosPorDia = React.useMemo(() => {
    const mapa = new Map<string, EventoCalendarioLocal[]>();
    for (const evento of eventos) {
      const fechas = eachDayOfInterval({
        start: new Date(`${evento.fechaInicio}T00:00:00`),
        end: new Date(`${evento.fechaFin}T00:00:00`),
      });
      for (const fecha of fechas) {
        const clave = claveFecha(fecha);
        mapa.set(clave, [...(mapa.get(clave) ?? []), evento]);
      }
    }
    return mapa;
  }, [eventos]);

  const diasCalendario = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 }),
  });

  const claveSeleccionada = claveFecha(diaSeleccionado);
  const reservacionesSeleccionadas = reservacionesPorDia.get(claveSeleccionada) ?? [];
  const eventosSeleccionados = eventosPorDia.get(claveSeleccionada) ?? [];
  const visitantesSeleccionados = reservacionesSeleccionadas.reduce((total, item) => total + item.num_personas, 0);
  const puedeRetroceder = mesActual.getTime() > primerMes.getTime();
  const puedeAvanzar = mesActual.getTime() < ultimoMes.getTime();

  function cambiarMes(direccion: -1 | 1) {
    const siguiente = direccion === 1 ? addMonths(mesActual, 1) : subMonths(mesActual, 1);
    if (siguiente < primerMes || siguiente > ultimoMes) return;
    setMesActual(siguiente);
    setDiaSeleccionado(siguiente);
  }

  function abrirFormulario() {
    const fecha = claveFecha(diaSeleccionado);
    setTitulo("");
    setTipo("recordatorio");
    setFechaInicio(fecha);
    setFechaFin(fecha);
    setNotas("");
    setErrorFormulario("");
    setFormularioAbierto(true);
  }

  function guardarEvento(event: React.FormEvent) {
    event.preventDefault();
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) {
      setErrorFormulario("Escribe un título para el evento.");
      return;
    }
    if (fechaFin < fechaInicio) {
      setErrorFormulario("La fecha final no puede ser anterior a la fecha inicial.");
      return;
    }

    const nuevo: EventoCalendarioLocal = {
      id: crearIdEvento(),
      titulo: tituloLimpio,
      tipo,
      fechaInicio,
      fechaFin,
      notas: notas.trim() || undefined,
      creadoEn: new Date().toISOString(),
    };
    setEventos((actuales) => [...actuales, nuevo]);
    setDiaSeleccionado(new Date(`${fechaInicio}T00:00:00`));
    setMesActual(startOfMonth(new Date(`${fechaInicio}T00:00:00`)));
    setFormularioAbierto(false);
  }

  function eliminarEvento(id: string) {
    setEventos((actuales) => actuales.filter((evento) => evento.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Operación</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">Calendario operativo</h1>
          <p className="text-sm text-muted-foreground">
            Reservaciones confirmadas y eventos internos de los próximos cuatro meses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirFormulario}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Evento interno
          </button>
          <Link to="/reservaciones" className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Administrar reservaciones
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
        Los eventos internos se guardan únicamente en este dispositivo. Un “bloqueo operativo” es informativo y todavía no impide crear reservaciones.
      </div>

      {formularioAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Nuevo evento interno</CardTitle>
                <CardDescription>Agrega un recordatorio, mantenimiento, campaña o bloqueo visual.</CardDescription>
              </div>
              <button type="button" onClick={() => setFormularioAbierto(false)} aria-label="Cerrar" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={guardarEvento} className="space-y-4">
                <label className="block space-y-1.5 text-sm font-medium">
                  Título
                  <input value={titulo} onChange={(event) => setTitulo(event.target.value)} maxLength={100} autoFocus className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal outline-none focus:border-primary" placeholder="Ej. Mantenimiento de kayaks" />
                </label>
                <label className="block space-y-1.5 text-sm font-medium">
                  Tipo
                  <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoEventoCalendario)} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal outline-none focus:border-primary">
                    {Object.entries(TIPO_EVENTO).map(([valor, configuracion]) => <option key={valor} value={valor}>{configuracion.etiqueta}</option>)}
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5 text-sm font-medium">Desde<input type="date" value={fechaInicio} min={claveFecha(hoy)} onChange={(event) => { setFechaInicio(event.target.value); if (event.target.value > fechaFin) setFechaFin(event.target.value); }} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
                  <label className="block space-y-1.5 text-sm font-medium">Hasta<input type="date" value={fechaFin} min={fechaInicio} onChange={(event) => setFechaFin(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
                </div>
                <label className="block space-y-1.5 text-sm font-medium">Notas opcionales<textarea value={notas} onChange={(event) => setNotas(event.target.value)} maxLength={300} rows={3} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-normal outline-none focus:border-primary" placeholder="Información útil para la operación" /></label>
                {errorFormulario && <p className="text-sm text-destructive">{errorFormulario}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setFormularioAbierto(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
                  <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Guardar evento</button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
            <div><p className="font-medium">No se pudo cargar el calendario</p><p className="text-sm text-muted-foreground">Reintenta para consultar las reservaciones confirmadas.</p></div>
            <button type="button" onClick={() => refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Reintentar</button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div><CardTitle className="capitalize">{format(mesActual, "MMMM yyyy", { locale: es })}</CardTitle><CardDescription>Selecciona un día para revisar su operación.</CardDescription></div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => cambiarMes(-1)} disabled={!puedeRetroceder} aria-label="Mes anterior" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => cambiarMes(1)} disabled={!puedeAvanzar} aria-label="Mes siguiente" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 border-b border-border pb-2">{DIAS_SEMANA.map((dia) => <span key={dia} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{dia}</span>)}</div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {diasCalendario.map((dia) => {
                  const clave = claveFecha(dia);
                  const reservaciones = reservacionesPorDia.get(clave) ?? [];
                  const eventosDia = eventosPorDia.get(clave) ?? [];
                  const visitantes = reservaciones.reduce((total, item) => total + item.num_personas, 0);
                  const seleccionado = isSameDay(dia, diaSeleccionado);
                  const fueraDelMes = !isSameMonth(dia, mesActual);
                  const pasado = dia < hoy;
                  return (
                    <button key={dia.toISOString()} type="button" onClick={() => !pasado && setDiaSeleccionado(dia)} disabled={pasado} className={cn("min-h-20 rounded-xl border p-2 text-left transition-all sm:min-h-24", fueraDelMes ? "border-transparent bg-muted/20 text-muted-foreground/50" : "border-border bg-card", !pasado && "hover:border-primary/40 hover:bg-primary/[0.03]", seleccionado && "border-primary bg-primary/5 ring-1 ring-primary/20", pasado && "cursor-not-allowed opacity-45", eventosDia.some((evento) => evento.tipo === "bloqueo") && !pasado && "border-destructive/40 bg-destructive/[0.03]")}> 
                      <div className="flex items-start justify-between gap-1"><span className={cn("text-xs font-semibold", isSameDay(dia, hoy) && "rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground")}>{format(dia, "d")}</span>{eventosDia.length > 0 && <div className="flex max-w-12 flex-wrap justify-end gap-1">{[...new Set(eventosDia.map((evento) => evento.tipo))].slice(0, 3).map((tipoEvento) => <span key={tipoEvento} className={cn("h-2 w-2 rounded-full", TIPO_EVENTO[tipoEvento].punto)} />)}</div>}</div>
                      {isLoading ? <div className="mt-3 h-2 w-8 animate-pulse rounded bg-muted" /> : reservaciones.length > 0 ? <div className="mt-2 space-y-1"><p className="text-[11px] font-semibold text-primary">{reservaciones.length} {reservaciones.length === 1 ? "reserva" : "reservas"}</p><p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Users className="h-3 w-3" /> {visitantes}</p></div> : null}
                      {eventosDia.length > 0 && <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground">{eventosDia[0].titulo}</p>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader><CardTitle className="capitalize">{format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}</CardTitle><CardDescription>{reservacionesSeleccionadas.length > 0 ? `${reservacionesSeleccionadas.length} reservaciones · ${visitantesSeleccionados} visitantes` : "Sin reservaciones confirmadas para este día."}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {eventosSeleccionados.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Eventos internos</p>{eventosSeleccionados.map((evento) => { const configuracion = TIPO_EVENTO[evento.tipo]; const Icono = configuracion.icono; return <div key={evento.id} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><span className={cn("mb-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold", configuracion.clase)}><Icono className="h-3 w-3" />{configuracion.etiqueta}</span><p className="truncate text-sm font-semibold">{evento.titulo}</p><p className="text-xs text-muted-foreground">{evento.fechaInicio === evento.fechaFin ? evento.fechaInicio : `${evento.fechaInicio} — ${evento.fechaFin}`}</p></div><button type="button" onClick={() => eliminarEvento(evento.id)} aria-label={`Eliminar ${evento.titulo}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>{evento.notas && <p className="mt-2 text-xs text-muted-foreground">{evento.notas}</p>}</div>; })}</div>}
              {reservacionesSeleccionadas.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reservaciones</p>{reservacionesSeleccionadas.map((item) => <div key={item.reservacion_id} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.servicio_nombre}</p><p className="truncate text-xs text-muted-foreground">{item.cliente_nombre}</p></div><EstadoBadge estado={item.estado} /></div><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{item.num_personas} {item.num_personas === 1 ? "persona" : "personas"}</p></div>)}</div>}
              {eventosSeleccionados.length === 0 && reservacionesSeleccionadas.length === 0 && <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center"><CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm font-medium">Día sin actividad registrada</p><button type="button" onClick={abrirFormulario} className="mt-3 text-xs font-semibold text-primary hover:underline">Agregar evento interno</button></div>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
