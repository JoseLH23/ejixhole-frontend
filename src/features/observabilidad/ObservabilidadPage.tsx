import { Activity, Database, ListTodo, RefreshCw, Server, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useObservabilidad } from "./useObservabilidad";

function Estado({ valor }: { valor: string }) {
  const ok = valor === "healthy" || valor === "up";
  const unknown = valor === "unknown";
  const texto = ok ? "Operativo" : unknown ? "Sin medición" : valor === "degraded" ? "Degradado" : "No disponible";
  const clase = ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : unknown ? "border-amber-500/30 bg-amber-500/10 text-amber-700" : "border-destructive/30 bg-destructive/10 text-destructive";
  return <Badge variant="outline" className={clase}>{texto}</Badge>;
}

function Componente({ nombre, detalle, estado, icon: Icon }: { nombre: string; detalle: string; estado: string; icon: typeof Server }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4" /></div><div><p className="font-medium">{nombre}</p><p className="text-xs text-muted-foreground">{detalle}</p></div></div><Estado valor={estado} /></div></div>;
}

function Metrica({ etiqueta, valor, objetivo }: { etiqueta: string; valor: string; objetivo?: string }) {
  return <div className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{etiqueta}</p><p className="mt-1 text-xl font-semibold">{valor}</p>{objetivo && <p className="text-xs text-muted-foreground">Objetivo: {objetivo}</p>}</div>;
}

const porcentaje = (valor: number | null | undefined) => valor == null ? "Pendiente" : `${valor.toFixed(3)}%`;
const conteo = (valor: number | undefined, texto: string) => valor == null ? `${texto}: desconocido` : `${valor} ${texto}`;

export function ObservabilidadPage() {
  const { data, isLoading, isFetching, refetch } = useObservabilidad();
  const backend = data?.backend.ok ? data.backend.data : null;
  const mhCore = data?.mhCore.ok ? data.mhCore.data : null;
  const jobs = mhCore?.current.checks.durable_jobs;
  const deadLetters = jobs?.dead_letter;
  const cola = jobs ? `${conteo(jobs.pending, "pendientes")} · ${conteo(jobs.running, "ejecutándose")}` : "Sin respuesta";

  return <div className="space-y-4">
    <PageHeader titulo="Observabilidad" descripcion="Salud técnica, cola durable y objetivos de disponibilidad del ecosistema." icon={Activity} acento="secondary" acciones={<Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Actualizar</Button>} />
    {isLoading ? <div className="h-32 animate-pulse rounded-xl bg-muted" /> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Componente nombre="Backend API" detalle={backend ? `${backend.http.requests.lifetime_total} solicitudes desde el arranque` : "Sin respuesta"} estado={backend?.status ?? "unavailable"} icon={Server} />
        <Componente nombre="PostgreSQL EjiXhole" detalle={backend ? `${backend.dependencies.database.latency_ms} ms` : "Sin respuesta"} estado={backend?.dependencies.database.status ?? "unavailable"} icon={Database} />
        <Componente nombre="MH-Core" detalle={mhCore ? "Cerebro privado del ecosistema" : "Sin respuesta"} estado={mhCore?.status ?? "unavailable"} icon={Activity} />
        <Componente nombre="Persistencia MH-Core" detalle={mhCore?.current.checks.persistence.backend ?? "Motor no identificado"} estado={mhCore?.current.checks.persistence.status ?? "unavailable"} icon={Database} />
        <Componente nombre="Estado analítico EjiXhole" detalle={mhCore?.current.checks.ejixhole_state.backend ?? "Motor no identificado"} estado={mhCore?.current.checks.ejixhole_state.status ?? "unavailable"} icon={Database} />
        <Componente nombre="Cola durable" detalle={cola} estado={jobs?.status ?? "unavailable"} icon={ListTodo} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">SLO del Backend</h2><Estado valor={backend?.http.slo.status ?? "unavailable"} /></div><div className="grid gap-2 sm:grid-cols-3"><Metrica etiqueta="Disponibilidad" valor={porcentaje(backend?.http.slo.availability_percent)} objetivo={backend ? `${backend.http.slo.targets.availability_percent}%` : undefined} /><Metrica etiqueta="Errores 5xx" valor={porcentaje(backend?.http.slo.error_rate_percent)} objetivo={backend ? `≤ ${backend.http.slo.targets.error_rate_percent}%` : undefined} /><Metrica etiqueta="Latencia p95" valor={backend ? `${backend.http.latency_ms.p95} ms` : "Pendiente"} objetivo={backend ? `≤ ${backend.http.slo.targets.latency_p95_ms} ms` : undefined} /></div></section>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">SLO de MH-Core</h2><Estado valor={mhCore?.slo.status ?? "unavailable"} /></div><div className="grid gap-2 sm:grid-cols-3"><Metrica etiqueta="Disponibilidad" valor={porcentaje(mhCore?.slo.availability_percent)} objetivo={mhCore ? `${mhCore.slo.target_percent}%` : undefined} /><Metrica etiqueta="Tiempo conocido" valor={mhCore ? `${Math.round(mhCore.slo.known_seconds)} s` : "Pendiente"} /><Metrica etiqueta="Dead-letter" valor={deadLetters == null ? "Desconocido" : String(deadLetters)} objetivo="0" /></div></section>
      </div>
      {mhCore && !mhCore.slo.measurement_complete && <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800"><TriangleAlert className="h-4 w-4 shrink-0" /><p>MH-Core todavía no tiene tiempo de observación suficiente o detectó un intervalo sin sondeo. La disponibilidad permanece como desconocida.</p></div>}
      {deadLetters != null && deadLetters > 0 && <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><TriangleAlert className="h-4 w-4 shrink-0" /><p>Existen {deadLetters} trabajos en dead-letter que requieren revisión.</p></div>}
      <p className="text-right text-xs text-muted-foreground">Última comprobación: {data ? new Date(data.checkedAt).toLocaleString("es-MX") : "—"}</p>
    </>}
  </div>;
}
