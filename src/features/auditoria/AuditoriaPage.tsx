import * as React from "react";
import { Eye, FilterX, History, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AuditEvent, AuditEventFilters } from "@/types/auditEvent";
import {
  ENTIDADES,
  diferencias,
  etiquetaAccion,
  etiquetaEntidad,
  fechaLegible,
  textoSeguro,
} from "./auditPresentation";
import { useAuditoria } from "./useAuditoria";

const LIMITE = 50;

function aInicioDia(valor: string): string | undefined {
  return valor ? new Date(`${valor}T00:00:00`).toISOString() : undefined;
}

function aFinDia(valor: string): string | undefined {
  return valor ? new Date(`${valor}T23:59:59.999`).toISOString() : undefined;
}

function ResumenCambios({ evento }: { evento: AuditEvent }) {
  const cambios = diferencias(evento.antes, evento.despues);
  if (cambios.length === 0) return <span className="text-muted-foreground">Sin diferencias de campos</span>;
  return <span>{cambios.length} campo{cambios.length === 1 ? "" : "s"}</span>;
}

function DetalleEvento({ evento, open, onOpenChange }: { evento: AuditEvent | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const cambios = evento ? diferencias(evento.antes, evento.despues) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {evento && (
          <>
            <DialogHeader>
              <DialogTitle>{etiquetaAccion(evento.accion)}</DialogTitle>
              <DialogDescription>
                {fechaLegible(evento.fecha_creacion)} · {etiquetaEntidad(evento.entidad_tipo)} #{evento.entidad_id ?? "—"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Actor</p><p className="font-medium">{evento.actor_nombre ?? "Sistema"}</p></div>
              <div><p className="text-xs text-muted-foreground">Rol</p><p className="font-medium">{evento.actor_rol ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Origen</p><p className="font-medium">{evento.origen}</p></div>
              <div><p className="text-xs text-muted-foreground">Request ID</p><p className="break-all font-mono text-xs">{evento.request_id ?? "—"}</p></div>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Comparación antes / después</h3>
              {cambios.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Este evento no modificó campos comparables o representa una acción puntual.
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="grid grid-cols-[minmax(120px,0.7fr)_1fr_1fr] bg-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Campo</span><span>Antes</span><span>Después</span>
                  </div>
                  {cambios.map(({ clave, antes, despues }) => (
                    <div key={clave} className="grid grid-cols-[minmax(120px,0.7fr)_1fr_1fr] gap-3 border-t border-border px-3 py-2 text-sm">
                      <span className="font-medium">{clave.replaceAll("_", " ")}</span>
                      <pre className="whitespace-pre-wrap break-words font-sans text-muted-foreground">{textoSeguro(clave, antes)}</pre>
                      <pre className="whitespace-pre-wrap break-words font-sans">{textoSeguro(clave, despues)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {evento.contexto && Object.keys(evento.contexto).length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Contexto seguro</h3>
                <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                  {Object.entries(evento.contexto).map(([clave, valor]) => (
                    <div key={clave} className="text-sm">
                      <p className="text-xs text-muted-foreground">{clave.replaceAll("_", " ")}</p>
                      <p className="break-words">{textoSeguro(clave, valor)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AuditoriaPage() {
  const [entidadTipo, setEntidadTipo] = React.useState("");
  const [accion, setAccion] = React.useState("");
  const [entidadId, setEntidadId] = React.useState("");
  const [actorId, setActorId] = React.useState("");
  const [desde, setDesde] = React.useState("");
  const [hasta, setHasta] = React.useState("");
  const [offset, setOffset] = React.useState(0);
  const [seleccionado, setSeleccionado] = React.useState<AuditEvent | null>(null);

  const filtros = React.useMemo<AuditEventFilters>(() => ({
    entidad_tipo: entidadTipo || undefined,
    entidad_id: entidadId.trim() || undefined,
    accion: accion.trim() || undefined,
    actor_usuario_id: actorId ? Number(actorId) : undefined,
    desde: aInicioDia(desde),
    hasta: aFinDia(hasta),
    limit: LIMITE,
    offset,
  }), [accion, actorId, desde, entidadId, entidadTipo, hasta, offset]);

  const { data: eventos, isLoading, isError, error, refetch, isFetching } = useAuditoria(filtros);

  React.useEffect(() => setOffset(0), [accion, actorId, desde, entidadId, entidadTipo, hasta]);

  const limpiar = () => {
    setEntidadTipo("");
    setAccion("");
    setEntidadId("");
    setActorId("");
    setDesde("");
    setHasta("");
    setOffset(0);
  };

  const columnas: DataTableColumn<AuditEvent>[] = [
    { header: "Fecha", cell: (evento) => <span className="whitespace-nowrap text-sm">{fechaLegible(evento.fecha_creacion)}</span> },
    { header: "Acción", cell: (evento) => <div><p className="font-medium">{etiquetaAccion(evento.accion)}</p><p className="text-xs text-muted-foreground">{evento.accion}</p></div> },
    { header: "Entidad", cell: (evento) => <div><Badge variant="outline">{etiquetaEntidad(evento.entidad_tipo)}</Badge><p className="mt-1 text-xs text-muted-foreground">ID {evento.entidad_id ?? "—"}</p></div> },
    { header: "Actor", cell: (evento) => <div><p>{evento.actor_nombre ?? "Sistema"}</p><p className="text-xs text-muted-foreground">{evento.actor_rol ?? evento.origen}</p></div> },
    { header: "Cambios", cell: (evento) => <ResumenCambios evento={evento} /> },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        titulo="Auditoría"
        descripcion="Consulta quién cambió usuarios, tarifas, reservaciones, pagos y caja. El historial es de solo lectura."
        icon={History}
        acento="wood"
      />

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" /> Filtros de trazabilidad</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <select aria-label="Entidad" value={entidadTipo} onChange={(e) => setEntidadTipo(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-[13px]">
            {ENTIDADES.map(([valor, etiqueta]) => <option key={valor || "todas"} value={valor}>{etiqueta}</option>)}
          </select>
          <Input aria-label="Acción" placeholder="Acción, ej. pago.registrado" value={accion} onChange={(e) => setAccion(e.target.value)} />
          <Input aria-label="ID de entidad" placeholder="ID de entidad" value={entidadId} onChange={(e) => setEntidadId(e.target.value)} />
          <Input aria-label="ID de actor" type="number" min={1} placeholder="ID de actor" value={actorId} onChange={(e) => setActorId(e.target.value)} />
          <Input aria-label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input aria-label="Hasta" type="date" min={desde || undefined} value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={limpiar}><FilterX className="mr-2 h-4 w-4" /> Limpiar filtros</Button>
        </div>
      </div>

      {isLoading && <TableSkeleton columnas={5} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}
      {!isLoading && !isError && (eventos?.length ?? 0) === 0 && <EmptyState titulo="No hay eventos para estos filtros" icon={History} />}
      {!isLoading && !isError && eventos && eventos.length > 0 && (
        <>
          <DataTable
            columns={columnas}
            data={eventos}
            getRowId={(evento) => evento.id}
            renderAcciones={(evento) => (
              <Button variant="ghost" size="sm" onClick={() => setSeleccionado(evento)}>
                <Eye className="mr-1 h-4 w-4" /> Ver detalle
              </Button>
            )}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mostrando {offset + 1}–{offset + eventos.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={offset === 0 || isFetching} onClick={() => setOffset((valor) => Math.max(0, valor - LIMITE))}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={eventos.length < LIMITE || isFetching} onClick={() => setOffset((valor) => valor + LIMITE)}>Siguiente</Button>
            </div>
          </div>
        </>
      )}

      <DetalleEvento evento={seleccionado} open={seleccionado !== null} onOpenChange={(open) => !open && setSeleccionado(null)} />
    </div>
  );
}
