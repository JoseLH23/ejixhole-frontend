import * as React from "react";
import { Calculator, Pencil, Percent, Plus, Power, Trash2, X } from "lucide-react";

import { useServicios } from "@/features/servicios/useServicios";
import { useUnidadesHospedaje } from "@/features/reservaciones/useUnidadesHospedaje";
import type { AplicaTarifa, TarifaEspecial, TarifaEspecialInput } from "@/types/tarifaEspecial";
import {
  useActualizarTarifaEspecial,
  useCrearTarifaEspecial,
  useEliminarTarifaEspecial,
  useSimularTarifaEspecial,
  useTarifasEspeciales,
} from "./useTarifasEspeciales";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const APLICA: Record<AplicaTarifa, string> = { todos: "Todos", entrada: "Entrada", camping: "Camping", hospedaje: "Hospedaje" };
const inicial: TarifaEspecialInput = { nombre: "", descripcion: "", fecha_inicio: "", fecha_fin: "", porcentaje_ajuste: 0, aplica_a: "todos", dias_semana: null, prioridad: 0, unidad_hospedaje_id: null, activa: true };
const hoy = new Date().toISOString().slice(0, 10);

type TipoSimulacion = "entrada" | "camping" | "hospedaje";

export function TarifasEspecialesPage() {
  const tarifas = useTarifasEspeciales();
  const unidades = useUnidadesHospedaje();
  const servicios = useServicios();
  const crear = useCrearTarifaEspecial();
  const actualizar = useActualizarTarifaEspecial();
  const eliminar = useEliminarTarifaEspecial();
  const simular = useSimularTarifaEspecial();
  const [abierto, setAbierto] = React.useState(false);
  const [editandoId, setEditandoId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<TarifaEspecialInput>(inicial);
  const [error, setError] = React.useState("");
  const [escenario, setEscenario] = React.useState({ tipo: "entrada" as TipoSimulacion, servicioId: 0, llegada: hoy, salida: hoy, personas: 1, unidadId: null as number | null });

  function abrirNueva() {
    setEditandoId(null);
    setForm({ ...inicial });
    setError("");
    simular.reset();
    setAbierto(true);
  }

  function abrirEditar(tarifa: TarifaEspecial) {
    setEditandoId(tarifa.id);
    setForm({ nombre: tarifa.nombre, descripcion: tarifa.descripcion ?? "", fecha_inicio: tarifa.fecha_inicio, fecha_fin: tarifa.fecha_fin, porcentaje_ajuste: Number(tarifa.porcentaje_ajuste), aplica_a: tarifa.aplica_a, dias_semana: tarifa.dias_semana ? [...tarifa.dias_semana] : null, prioridad: tarifa.prioridad, unidad_hospedaje_id: tarifa.unidad_hospedaje_id, activa: tarifa.activa });
    setError("");
    simular.reset();
    setAbierto(true);
  }

  function alternarDia(dia: number) {
    const actuales = form.dias_semana ?? [];
    const nuevos = actuales.includes(dia) ? actuales.filter((item) => item !== dia) : [...actuales, dia].sort();
    setForm({ ...form, dias_semana: nuevos.length ? nuevos : null });
  }

  function validarTarifa() {
    if (!form.nombre.trim()) return "Escribe un nombre.";
    if (!form.fecha_inicio || !form.fecha_fin || form.fecha_fin < form.fecha_inicio) return "Revisa el rango de fechas.";
    if (form.unidad_hospedaje_id && !["todos", "hospedaje"].includes(form.aplica_a)) return "Una unidad específica solo puede usarse con hospedaje.";
    return "";
  }

  async function guardar(event: React.FormEvent) {
    event.preventDefault();
    const validacion = validarTarifa();
    if (validacion) return setError(validacion);
    const data = { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || null };
    try {
      if (editandoId) await actualizar.mutateAsync({ id: editandoId, data });
      else await crear.mutateAsync(data);
      setAbierto(false);
    } catch {
      setError(editandoId ? "No se pudo actualizar la tarifa." : "No se pudo guardar la tarifa.");
    }
  }

  async function ejecutarSimulacion() {
    const validacion = validarTarifa();
    if (validacion) return setError(validacion);
    if (!escenario.servicioId) return setError("Selecciona el servicio para simular.");
    if (escenario.tipo !== "entrada" && escenario.salida <= escenario.llegada) return setError("La salida debe ser posterior a la llegada.");
    if (escenario.tipo === "hospedaje" && !escenario.unidadId) return setError("Selecciona una unidad de hospedaje.");
    setError("");
    await simular.mutateAsync({
      servicio_id: escenario.servicioId,
      tipo_reservacion: escenario.tipo,
      fecha_llegada: escenario.llegada,
      fecha_salida: escenario.tipo === "entrada" ? escenario.llegada : escenario.salida,
      num_personas: escenario.personas,
      unidad_hospedaje_id: escenario.tipo === "hospedaje" ? escenario.unidadId : null,
      candidata: { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || null, activa: true },
    }).catch(() => setError("No se pudo simular. Revisa servicio, fechas y capacidad."));
  }

  const nombreUnidad = (id: number | null) => unidades.data?.find((unidad) => unidad.id === id)?.nombre;
  const guardando = crear.isPending || actualizar.isPending;
  const serviciosActivos = servicios.data?.filter((servicio) => servicio.activo) ?? [];
  const dinero = (valor: string) => Number(valor).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Ingresos</p><h1 className="font-display text-2xl font-semibold">Tarifas especiales</h1><p className="text-sm text-muted-foreground">Temporadas, promociones y ajustes automáticos por fecha.</p></div><button type="button" onClick={abrirNueva} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Nueva tarifa</button></div>
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">Por cada día se aplica únicamente la regla activa de mayor prioridad. Los descuentos usan porcentaje negativo.</div>

    {tarifas.isLoading ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : tarifas.isError ? <div className="rounded-xl border p-8 text-center"><p>No se pudieron cargar las tarifas.</p><button onClick={() => tarifas.refetch()} className="mt-3 text-sm font-semibold text-primary">Reintentar</button></div> : (tarifas.data?.length ?? 0) === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><Percent className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Sin tarifas especiales</p><p className="text-sm text-muted-foreground">Los precios base continúan funcionando normalmente.</p></div> : <div className="grid gap-3 lg:grid-cols-2">{tarifas.data?.map((tarifa) => { const porcentaje = Number(tarifa.porcentaje_ajuste); return <article key={tarifa.id} className={`rounded-2xl border bg-card p-4 shadow-sm ${!tarifa.activa ? "opacity-60" : ""}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{tarifa.nombre}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${porcentaje < 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{porcentaje > 0 ? "+" : ""}{porcentaje}%</span>{!tarifa.activa && <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">Inactiva</span>}</div><p className="mt-1 text-xs text-muted-foreground">{tarifa.fecha_inicio} — {tarifa.fecha_fin}</p></div><div className="flex gap-1"><button type="button" title="Editar" onClick={() => abrirEditar(tarifa)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button><button type="button" title={tarifa.activa ? "Desactivar" : "Activar"} disabled={actualizar.isPending} onClick={() => actualizar.mutate({ id: tarifa.id, data: { activa: !tarifa.activa } })} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Power className="h-4 w-4" /></button><button type="button" title="Eliminar" disabled={eliminar.isPending} onClick={() => window.confirm(`¿Eliminar ${tarifa.nombre}?`) && eliminar.mutate(tarifa.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Aplica a</span><p className="font-medium">{APLICA[tarifa.aplica_a]}</p></div><div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Prioridad</span><p className="font-medium">{tarifa.prioridad}</p></div><div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Días</span><p className="font-medium">{tarifa.dias_semana?.map((dia) => DIAS[dia]).join(", ") || "Todos"}</p></div><div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Unidad</span><p className="truncate font-medium">{nombreUnidad(tarifa.unidad_hospedaje_id) || "Todas"}</p></div></div>{tarifa.descripcion && <p className="mt-3 text-xs text-muted-foreground">{tarifa.descripcion}</p>}</article>; })}</div>}

    {abierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-card shadow-xl"><div className="flex items-start justify-between border-b p-5"><div><h2 className="font-display text-xl font-semibold">{editandoId ? "Editar tarifa especial" : "Nueva tarifa especial"}</h2><p className="text-sm text-muted-foreground">Configura y prueba antes de guardar.</p></div><button type="button" onClick={() => setAbierto(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <form onSubmit={guardar} className="space-y-4 p-5">
        <label className="block text-sm font-medium">Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={120} autoFocus className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Desde<input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value, fecha_fin: form.fecha_fin < e.target.value ? e.target.value : form.fecha_fin })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label><label className="text-sm font-medium">Hasta<input type="date" min={form.fecha_inicio} value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label></div>
        <div className="grid gap-3 sm:grid-cols-3"><label className="text-sm font-medium">Ajuste %<input type="number" min={-100} max={500} step="0.01" value={form.porcentaje_ajuste} onChange={(e) => setForm({ ...form, porcentaje_ajuste: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label><label className="text-sm font-medium">Aplica a<select value={form.aplica_a} onChange={(e) => setForm({ ...form, aplica_a: e.target.value as AplicaTarifa, unidad_hospedaje_id: ["todos", "hospedaje"].includes(e.target.value) ? form.unidad_hospedaje_id : null })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2">{Object.entries(APLICA).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}</select></label><label className="text-sm font-medium">Prioridad<input type="number" min={-1000} max={1000} value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label></div>
        <div><p className="text-sm font-medium">Días de la semana</p><div className="mt-2 flex flex-wrap gap-2">{DIAS.map((dia, index) => <button key={dia} type="button" onClick={() => alternarDia(index)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${(form.dias_semana ?? []).includes(index) ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{dia}</button>)}</div><p className="mt-1 text-xs text-muted-foreground">Sin selección significa todos los días.</p></div>
        {["todos", "hospedaje"].includes(form.aplica_a) && <label className="block text-sm font-medium">Unidad específica<select value={form.unidad_hospedaje_id ?? ""} onChange={(e) => setForm({ ...form, unidad_hospedaje_id: e.target.value ? Number(e.target.value) : null })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2"><option value="">Todas las unidades</option>{unidades.data?.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}</select></label>}
        <label className="block text-sm font-medium">Descripción opcional<textarea value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} maxLength={2000} className="mt-1.5 w-full resize-none rounded-lg border bg-background px-3 py-2" /></label>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /><h3 className="font-semibold">Simular antes de guardar</h3></div><p className="mt-1 text-xs text-muted-foreground">No crea ni modifica ninguna tarifa.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-xs font-medium">Tipo<select value={escenario.tipo} onChange={(e) => { const tipo = e.target.value as TipoSimulacion; setEscenario({ ...escenario, tipo, salida: tipo === "entrada" ? escenario.llegada : escenario.salida }); }} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option value="entrada">Entrada</option><option value="camping">Camping</option><option value="hospedaje">Hospedaje</option></select></label><label className="text-xs font-medium">Servicio<select value={escenario.servicioId || ""} onChange={(e) => setEscenario({ ...escenario, servicioId: Number(e.target.value) })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option value="">Selecciona</option>{serviciosActivos.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}</select></label><label className="text-xs font-medium">Personas<input type="number" min={1} max={500} value={escenario.personas} onChange={(e) => setEscenario({ ...escenario, personas: Number(e.target.value) })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></label><label className="text-xs font-medium">Llegada<input type="date" value={escenario.llegada} onChange={(e) => setEscenario({ ...escenario, llegada: e.target.value, salida: escenario.tipo === "entrada" ? e.target.value : escenario.salida })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></label>{escenario.tipo !== "entrada" && <label className="text-xs font-medium">Salida<input type="date" min={escenario.llegada} value={escenario.salida} onChange={(e) => setEscenario({ ...escenario, salida: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></label>}{escenario.tipo === "hospedaje" && <label className="text-xs font-medium">Unidad<select value={escenario.unidadId ?? ""} onChange={(e) => setEscenario({ ...escenario, unidadId: e.target.value ? Number(e.target.value) : null })} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"><option value="">Selecciona</option>{unidades.data?.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}</select></label>}</div><button type="button" onClick={ejecutarSimulacion} disabled={simular.isPending} className="mt-3 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">{simular.isPending ? "Calculando…" : "Simular tarifa"}</button>{simular.data && <div className="mt-4 space-y-3"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-lg bg-background p-3"><p className="text-xs text-muted-foreground">Precio base</p><p className="font-semibold">{dinero(simular.data.total_base)}</p></div><div className="rounded-lg bg-background p-3"><p className="text-xs text-muted-foreground">Precio actual</p><p className="font-semibold">{dinero(simular.data.total_actual)}</p></div><div className="rounded-lg bg-background p-3"><p className="text-xs text-muted-foreground">Con borrador</p><p className="font-semibold text-primary">{dinero(simular.data.total_con_candidata)}</p></div></div><p className="text-sm">Regla ganadora: <strong>{simular.data.regla_ganadora || "Ninguna"}</strong></p>{simular.data.conflictos.length > 0 && <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs"><strong>Conflictos detectados:</strong> {simular.data.conflictos.join(", ")}</div>}</div>}</section>

        {error && <p className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setAbierto(false)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button><button type="submit" disabled={guardando} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Guardar tarifa"}</button></div>
      </form></div></div>}
  </div>;
}
