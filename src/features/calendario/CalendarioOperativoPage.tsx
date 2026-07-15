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
import { Ban, Bell, CalendarDays, ChevronLeft, ChevronRight, Megaphone, Plus, Trash2, Users, Wrench, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { ProximaReservacionItem } from "@/types/reporte";
import type { EventoCalendario, TipoEventoCalendario } from "@/types/eventoCalendario";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";
import { cargarEventosCalendario } from "./calendarioLocal";
import { eventosCalendarioApi } from "@/api/eventosCalendario";
import { useCrearEventoCalendario, useEliminarEventoCalendario, useEventosCalendario } from "./useEventosCalendario";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_VISIBLES = 4;

const TIPO_EVENTO: Record<TipoEventoCalendario, { etiqueta: string; icono: typeof Ban; clase: string; punto: string }> = {
  bloqueo: { etiqueta: "Bloqueo operativo", icono: Ban, clase: "bg-destructive/10 text-destructive", punto: "bg-destructive" },
  mantenimiento: { etiqueta: "Mantenimiento", icono: Wrench, clase: "bg-warning/10 text-warning", punto: "bg-warning" },
  recordatorio: { etiqueta: "Recordatorio", icono: Bell, clase: "bg-primary/10 text-primary", punto: "bg-primary" },
  campana: { etiqueta: "Campaña", icono: Megaphone, clase: "bg-secondary/10 text-secondary", punto: "bg-secondary" },
};

function claveFecha(fecha: Date) {
  return format(fecha, "yyyy-MM-dd");
}

function claveMigracion(scope: string) {
  return `ejixhole:calendario:migrado-api:${scope}`;
}

export function CalendarioOperativoPage() {
  const { usuario } = useAuth();
  const hoy = startOfToday();
  const primerMes = startOfMonth(hoy);
  const ultimoMes = addMonths(primerMes, MESES_VISIBLES - 1);
  const scopeUsuario = usuario?.email?.toLowerCase() || "usuario";
  const desde = claveFecha(primerMes);
  const hasta = claveFecha(endOfMonth(ultimoMes));

  const [mesActual, setMesActual] = React.useState(primerMes);
  const [diaSeleccionado, setDiaSeleccionado] = React.useState(hoy);
  const [formularioAbierto, setFormularioAbierto] = React.useState(false);
  const [titulo, setTitulo] = React.useState("");
  const [tipo, setTipo] = React.useState<TipoEventoCalendario>("recordatorio");
  const [fechaInicio, setFechaInicio] = React.useState(claveFecha(hoy));
  const [fechaFin, setFechaFin] = React.useState(claveFecha(hoy));
  const [notas, setNotas] = React.useState("");
  const [errorFormulario, setErrorFormulario] = React.useState("");
  const [migrando, setMigrando] = React.useState(false);

  const reservacionesQuery = useReporteProximasReservaciones({ dias: 125, estado: "confirmada" });
  const eventosQuery = useEventosCalendario({ desde, hasta });
  const crearEvento = useCrearEventoCalendario();
  const eliminarEvento = useEliminarEventoCalendario();
  const eventos = eventosQuery.data ?? [];

  React.useEffect(() => {
    const locales = cargarEventosCalendario(scopeUsuario);
    const marker = claveMigracion(scopeUsuario);
    if (localStorage.getItem(marker) || locales.length === 0 || migrando) return;

    setMigrando(true);
    Promise.all(
      locales.map((evento) =>
        eventosCalendarioApi.crear({
          titulo: evento.titulo,
          tipo: evento.tipo,
          fecha_inicio: evento.fechaInicio,
          fecha_fin: evento.fechaFin,
          notas: evento.notas ?? null,
        })
      )
    )
      .then(() => {
        localStorage.setItem(marker, "1");
        localStorage.removeItem(`ejixhole:calendario:eventos:${scopeUsuario}`);
        return eventosQuery.refetch();
      })
      .catch(() => undefined)
      .finally(() => setMigrando(false));
  }, [scopeUsuario, migrando, eventosQuery]);

  const reservacionesPorDia = React.useMemo(() => {
    const mapa = new Map<string, ProximaReservacionItem[]>();
    for (const item of reservacionesQuery.data?.items ?? []) {
      mapa.set(item.fecha_visita, [...(mapa.get(item.fecha_visita) ?? []), item]);
    }
    return mapa;
  }, [reservacionesQuery.data]);

  const eventosPorDia = React.useMemo(() => {
    const mapa = new Map<string, EventoCalendario[]>();
    for (const evento of eventos) {
      for (const fecha of eachDayOfInterval({ start: new Date(`${evento.fecha_inicio}T00:00:00`), end: new Date(`${evento.fecha_fin}T00:00:00`) })) {
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

  function cambiarMes(direccion: -1 | 1) {
    const siguiente = direccion === 1 ? addMonths(mesActual, 1) : subMonths(mesActual, 1);
    if (siguiente < primerMes || siguiente > ultimoMes) return;
    setMesActual(siguiente);
    setDiaSeleccionado(siguiente);
  }

  function abrirFormulario() {
    const fecha = claveFecha(diaSeleccionado);
    setTitulo(""); setTipo("recordatorio"); setFechaInicio(fecha); setFechaFin(fecha); setNotas(""); setErrorFormulario(""); setFormularioAbierto(true);
  }

  async function guardarEvento(event: React.FormEvent) {
    event.preventDefault();
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) return setErrorFormulario("Escribe un título para el evento.");
    if (fechaFin < fechaInicio) return setErrorFormulario("La fecha final no puede ser anterior a la fecha inicial.");
    try {
      await crearEvento.mutateAsync({ titulo: tituloLimpio, tipo, fecha_inicio: fechaInicio, fecha_fin: fechaFin, notas: notas.trim() || null });
      setDiaSeleccionado(new Date(`${fechaInicio}T00:00:00`));
      setMesActual(startOfMonth(new Date(`${fechaInicio}T00:00:00`)));
      setFormularioAbierto(false);
    } catch {
      setErrorFormulario("No se pudo guardar el evento. Reintenta.");
    }
  }

  const hayError = reservacionesQuery.isError || eventosQuery.isError;
  const cargando = reservacionesQuery.isLoading || eventosQuery.isLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Operación</p><h1 className="font-display text-2xl font-semibold">Calendario operativo</h1><p className="text-sm text-muted-foreground">Reservaciones confirmadas y eventos compartidos de los próximos cuatro meses.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={abrirFormulario} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Evento interno</button><Link to="/reservaciones" className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">Administrar reservaciones</Link></div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">Los eventos ahora se guardan en el backend y se comparten entre dispositivos. Los bloqueos todavía son informativos.</div>
      {migrando && <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">Migrando eventos guardados en este dispositivo…</div>}

      {formularioAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"><Card className="w-full max-w-lg"><CardHeader className="flex flex-row items-start justify-between space-y-0"><div><CardTitle>Nuevo evento interno</CardTitle><CardDescription>Visible para todos los administradores.</CardDescription></div><button type="button" onClick={() => setFormularioAbierto(false)}><X className="h-4 w-4" /></button></CardHeader><CardContent><form onSubmit={guardarEvento} className="space-y-4"><label className="block space-y-1.5 text-sm font-medium">Título<input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} autoFocus className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" /></label><label className="block space-y-1.5 text-sm font-medium">Tipo<select value={tipo} onChange={(e) => setTipo(e.target.value as TipoEventoCalendario)} className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal">{Object.entries(TIPO_EVENTO).map(([valor, config]) => <option key={valor} value={valor}>{config.etiqueta}</option>)}</select></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Desde<input type="date" value={fechaInicio} min={claveFecha(hoy)} onChange={(e) => { setFechaInicio(e.target.value); if (e.target.value > fechaFin) setFechaFin(e.target.value); }} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" /></label><label className="text-sm font-medium">Hasta<input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" /></label></div><label className="block text-sm font-medium">Notas opcionales<textarea value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={2000} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-normal" /></label>{errorFormulario && <p className="text-sm text-destructive">{errorFormulario}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setFormularioAbierto(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button><button type="submit" disabled={crearEvento.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{crearEvento.isPending ? "Guardando…" : "Guardar evento"}</button></div></form></CardContent></Card></div>}

      {hayError ? <Card><CardContent className="flex flex-col items-center gap-3 py-10 text-center"><CalendarDays className="h-8 w-8 text-muted-foreground" /><p>No se pudo cargar el calendario.</p><button type="button" onClick={() => { reservacionesQuery.refetch(); eventosQuery.refetch(); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Reintentar</button></CardContent></Card> : <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle className="capitalize">{format(mesActual, "MMMM yyyy", { locale: es })}</CardTitle><CardDescription>Selecciona un día para revisar su operación.</CardDescription></div><div className="flex gap-1"><button type="button" onClick={() => cambiarMes(-1)} disabled={mesActual.getTime() <= primerMes.getTime()} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => cambiarMes(1)} disabled={mesActual.getTime() >= ultimoMes.getTime()} className="rounded-lg border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></CardHeader><CardContent><div className="grid grid-cols-7 border-b pb-2">{DIAS_SEMANA.map((dia) => <span key={dia} className="text-center text-[11px] font-semibold text-muted-foreground">{dia}</span>)}</div><div className="mt-2 grid grid-cols-7 gap-1">{diasCalendario.map((dia) => { const clave = claveFecha(dia); const reservas = reservacionesPorDia.get(clave) ?? []; const eventosDia = eventosPorDia.get(clave) ?? []; const pasado = dia < hoy; return <button key={clave} type="button" disabled={pasado} onClick={() => setDiaSeleccionado(dia)} className={cn("min-h-20 rounded-xl border p-2 text-left sm:min-h-24", !isSameMonth(dia, mesActual) && "border-transparent bg-muted/20 opacity-50", isSameDay(dia, diaSeleccionado) && "border-primary bg-primary/5", eventosDia.some((e) => e.tipo === "bloqueo") && !pasado && "border-destructive/40 bg-destructive/[0.03]", pasado && "opacity-40")}><div className="flex justify-between"><span className={cn("text-xs font-semibold", isSameDay(dia, hoy) && "rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground")}>{format(dia, "d")}</span><div className="flex gap-1">{[...new Set(eventosDia.map((e) => e.tipo))].slice(0, 3).map((t) => <span key={t} className={cn("h-2 w-2 rounded-full", TIPO_EVENTO[t].punto)} />)}</div></div>{cargando ? <div className="mt-3 h-2 w-8 animate-pulse rounded bg-muted" /> : reservas.length > 0 && <div className="mt-2 text-[10px]"><p className="font-semibold text-primary">{reservas.length} reservas</p><p className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{reservas.reduce((s, r) => s + r.num_personas, 0)}</p></div>}{eventosDia[0] && <p className="mt-1 truncate text-[10px] text-muted-foreground">{eventosDia[0].titulo}</p>}</button>; })}</div></CardContent></Card>
        <Card className="h-fit"><CardHeader><CardTitle className="capitalize">{format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}</CardTitle><CardDescription>{reservacionesSeleccionadas.length} reservaciones · {visitantesSeleccionados} visitantes</CardDescription></CardHeader><CardContent className="space-y-4">{eventosSeleccionados.map((evento) => { const config = TIPO_EVENTO[evento.tipo]; const Icono = config.icono; return <div key={evento.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><div><span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold", config.clase)}><Icono className="h-3 w-3" />{config.etiqueta}</span><p className="mt-1 text-sm font-semibold">{evento.titulo}</p><p className="text-xs text-muted-foreground">{evento.fecha_inicio === evento.fecha_fin ? evento.fecha_inicio : `${evento.fecha_inicio} — ${evento.fecha_fin}`}</p></div><button type="button" disabled={eliminarEvento.isPending} onClick={() => eliminarEvento.mutate(evento.id)} className="h-fit rounded-lg p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>{evento.notas && <p className="mt-2 text-xs text-muted-foreground">{evento.notas}</p>}</div>; })}{reservacionesSeleccionadas.map((item) => <div key={item.reservacion_id} className="rounded-xl border p-3"><div className="flex justify-between"><div><p className="text-sm font-semibold">{item.servicio_nombre}</p><p className="text-xs text-muted-foreground">{item.cliente_nombre}</p></div><EstadoBadge estado={item.estado} /></div><p className="mt-2 text-xs text-muted-foreground">{item.num_personas} personas</p></div>)}{eventosSeleccionados.length === 0 && reservacionesSeleccionadas.length === 0 && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Día sin actividad registrada.</div>}</CardContent></Card>
      </div>}
    </div>
  );
}
