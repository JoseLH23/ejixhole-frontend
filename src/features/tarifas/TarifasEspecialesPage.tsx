import * as React from "react";
import { Percent, Plus, Power, Trash2, X } from "lucide-react";

import { useUnidadesHospedaje } from "@/features/reservaciones/useUnidadesHospedaje";
import type { AplicaTarifa, TarifaEspecialInput } from "@/types/tarifaEspecial";
import { useActualizarTarifaEspecial, useCrearTarifaEspecial, useEliminarTarifaEspecial, useTarifasEspeciales } from "./useTarifasEspeciales";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const APLICA: Record<AplicaTarifa, string> = { todos: "Todos", entrada: "Entrada", camping: "Camping", hospedaje: "Hospedaje" };

const inicial: TarifaEspecialInput = {
  nombre: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  porcentaje_ajuste: 0,
  aplica_a: "todos",
  dias_semana: null,
  prioridad: 0,
  unidad_hospedaje_id: null,
  activa: true,
};

export function TarifasEspecialesPage() {
  const tarifas = useTarifasEspeciales();
  const unidades = useUnidadesHospedaje();
  const crear = useCrearTarifaEspecial();
  const actualizar = useActualizarTarifaEspecial();
  const eliminar = useEliminarTarifaEspecial();
  const [abierto, setAbierto] = React.useState(false);
  const [form, setForm] = React.useState<TarifaEspecialInput>(inicial);
  const [error, setError] = React.useState("");

  function abrir() {
    setForm(inicial);
    setError("");
    setAbierto(true);
  }

  function alternarDia(dia: number) {
    const actuales = form.dias_semana ?? [];
    const nuevos = actuales.includes(dia) ? actuales.filter((item) => item !== dia) : [...actuales, dia].sort();
    setForm({ ...form, dias_semana: nuevos.length ? nuevos : null });
  }

  async function guardar(event: React.FormEvent) {
    event.preventDefault();
    if (!form.nombre.trim()) return setError("Escribe un nombre.");
    if (!form.fecha_inicio || !form.fecha_fin || form.fecha_fin < form.fecha_inicio) return setError("Revisa el rango de fechas.");
    if (form.unidad_hospedaje_id && !["todos", "hospedaje"].includes(form.aplica_a)) return setError("Una unidad específica solo puede usarse con hospedaje.");
    try {
      await crear.mutateAsync({ ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || null });
      setAbierto(false);
    } catch {
      setError("No se pudo guardar la tarifa.");
    }
  }

  const nombreUnidad = (id: number | null) => unidades.data?.find((unidad) => unidad.id === id)?.nombre;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ingresos</p>
          <h1 className="font-display text-2xl font-semibold">Tarifas especiales</h1>
          <p className="text-sm text-muted-foreground">Temporadas, promociones y ajustes automáticos por fecha.</p>
        </div>
        <button type="button" onClick={abrir} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Nueva tarifa
        </button>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Por cada día se aplica únicamente la regla activa de mayor prioridad. Los descuentos usan porcentaje negativo.
      </div>

      {tarifas.isLoading ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : tarifas.isError ? (
        <div className="rounded-xl border p-8 text-center"><p>No se pudieron cargar las tarifas.</p><button onClick={() => tarifas.refetch()} className="mt-3 text-sm font-semibold text-primary">Reintentar</button></div>
      ) : (tarifas.data?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center"><Percent className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">Sin tarifas especiales</p><p className="text-sm text-muted-foreground">Los precios base continúan funcionando normalmente.</p></div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {tarifas.data?.map((tarifa) => {
            const porcentaje = Number(tarifa.porcentaje_ajuste);
            return <article key={tarifa.id} className={`rounded-2xl border bg-card p-4 shadow-sm ${!tarifa.activa ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{tarifa.nombre}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${porcentaje < 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{porcentaje > 0 ? "+" : ""}{porcentaje}%</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">{tarifa.fecha_inicio} — {tarifa.fecha_fin}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" title={tarifa.activa ? "Desactivar" : "Activar"} disabled={actualizar.isPending} onClick={() => actualizar.mutate({ id: tarifa.id, data: { activa: !tarifa.activa } })} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Power className="h-4 w-4" /></button>
                  <button type="button" title="Eliminar" disabled={eliminar.isPending} onClick={() => window.confirm(`¿Eliminar ${tarifa.nombre}?`) && eliminar.mutate(tarifa.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Aplica a</span><p className="font-medium">{APLICA[tarifa.aplica_a]}</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Prioridad</span><p className="font-medium">{tarifa.prioridad}</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Días</span><p className="font-medium">{tarifa.dias_semana?.map((dia) => DIAS[dia]).join(", ") || "Todos"}</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><span className="text-muted-foreground">Unidad</span><p className="truncate font-medium">{nombreUnidad(tarifa.unidad_hospedaje_id) || "Todas"}</p></div>
              </div>
              {tarifa.descripcion && <p className="mt-3 text-xs text-muted-foreground">{tarifa.descripcion}</p>}
            </article>;
          })}
        </div>
      )}

      {abierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
        <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card shadow-xl">
          <div className="flex items-start justify-between border-b p-5"><div><h2 className="font-display text-xl font-semibold">Nueva tarifa especial</h2><p className="text-sm text-muted-foreground">Configura temporada, promoción o fin de semana.</p></div><button onClick={() => setAbierto(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
          <form onSubmit={guardar} className="space-y-4 p-5">
            <label className="block text-sm font-medium">Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={120} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" placeholder="Ej. Temporada alta de verano" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Desde<input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value, fecha_fin: form.fecha_fin < e.target.value ? e.target.value : form.fecha_fin })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label><label className="text-sm font-medium">Hasta<input type="date" min={form.fecha_inicio} value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label></div>
            <div className="grid gap-3 sm:grid-cols-3"><label className="text-sm font-medium">Ajuste %<input type="number" min={-100} max={500} step="0.01" value={form.porcentaje_ajuste} onChange={(e) => setForm({ ...form, porcentaje_ajuste: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label><label className="text-sm font-medium">Aplica a<select value={form.aplica_a} onChange={(e) => setForm({ ...form, aplica_a: e.target.value as AplicaTarifa, unidad_hospedaje_id: ["todos", "hospedaje"].includes(e.target.value) ? form.unidad_hospedaje_id : null })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2">{Object.entries(APLICA).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}</select></label><label className="text-sm font-medium">Prioridad<input type="number" min={-1000} max={1000} value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label></div>
            <div><p className="text-sm font-medium">Días de la semana</p><div className="mt-2 flex flex-wrap gap-2">{DIAS.map((dia, index) => <button key={dia} type="button" onClick={() => alternarDia(index)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${(form.dias_semana ?? []).includes(index) ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{dia}</button>)}</div><p className="mt-1 text-xs text-muted-foreground">Sin selección significa todos los días.</p></div>
            {["todos", "hospedaje"].includes(form.aplica_a) && <label className="block text-sm font-medium">Unidad específica<select value={form.unidad_hospedaje_id ?? ""} onChange={(e) => setForm({ ...form, unidad_hospedaje_id: e.target.value ? Number(e.target.value) : null })} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2"><option value="">Todas las unidades</option>{unidades.data?.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}</select></label>}
            <label className="block text-sm font-medium">Descripción opcional<textarea value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} maxLength={2000} className="mt-1.5 w-full resize-none rounded-lg border bg-background px-3 py-2" /></label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setAbierto(false)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button><button type="submit" disabled={crear.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{crear.isPending ? "Guardando…" : "Guardar tarifa"}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
