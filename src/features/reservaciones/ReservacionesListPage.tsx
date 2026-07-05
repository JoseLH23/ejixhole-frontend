import * as React from "react";
import { Plus, Search, CheckCircle2, XCircle, FlagTriangleRight, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EstadoBadge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useDebounce } from "@/hooks/useDebounce";
import { formatearMoneda } from "@/lib/format";
import { useClientes } from "@/features/clientes/useClientes";
import { useServicios } from "@/features/servicios/useServicios";
import { useReservaciones, useCambiarEstadoReservacion } from "./useReservaciones";
import { ReservacionFormModal } from "./ReservacionFormModal";
import { PagoModal } from "@/features/pagos/PagoModal";
import { ESTADOS_RESERVACION, type EstadoReservacion, type Reservacion } from "@/types/reservacion";

const FILTRO_TODOS = "todos";

/**
 * Transiciones de estado válidas según ReservacionService.cambiar_estado
 * en el backend: nunca desde un estado terminal (completada/cancelada),
 * nunca al mismo estado. Se listan aquí solo las que tienen sentido de
 * negocio (no se ofrece "volver a pendiente", por ejemplo).
 */
function accionesDisponibles(estado: EstadoReservacion) {
  if (estado === "pendiente") {
    return [
      { label: "Confirmar", nuevoEstado: "confirmada" as const, Icon: CheckCircle2, destructiva: false },
      { label: "Cancelar", nuevoEstado: "cancelada" as const, Icon: XCircle, destructiva: true },
    ];
  }
  if (estado === "confirmada") {
    return [
      { label: "Completar", nuevoEstado: "completada" as const, Icon: FlagTriangleRight, destructiva: false },
      { label: "Cancelar", nuevoEstado: "cancelada" as const, Icon: XCircle, destructiva: true },
    ];
  }
  return []; // completada/cancelada: estados terminales, sin acciones
}

export function ReservacionesListPage() {
  const { toast } = useToast();

  const [filtroEstado, setFiltroEstado] = React.useState<string>(FILTRO_TODOS);
  const [filtroServicio, setFiltroServicio] = React.useState<string>(FILTRO_TODOS);
  const [fechaDesde, setFechaDesde] = React.useState("");
  const [fechaHasta, setFechaHasta] = React.useState("");
  const [busqueda, setBusqueda] = React.useState("");
  const busquedaDebounced = useDebounce(busqueda);

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [pagoReservacionId, setPagoReservacionId] = React.useState<number | null>(null);
  const [transicionPendiente, setTransicionPendiente] = React.useState<{
    reservacion: Reservacion;
    nuevoEstado: EstadoReservacion;
    label: string;
  } | null>(null);

  // Filtros reales, enviados al backend (a diferencia de la búsqueda
  // de texto, que es local — GET /reservaciones sí soporta estos).
  const filtrosServidor = {
    estado: filtroEstado === FILTRO_TODOS ? undefined : (filtroEstado as EstadoReservacion),
    servicio_id: filtroServicio === FILTRO_TODOS ? undefined : Number(filtroServicio),
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  };

  const { data: reservaciones, isLoading, isError, error, refetch, isFetching } = useReservaciones(filtrosServidor);
  const cambiarEstado = useCambiarEstadoReservacion();

  // Reutiliza los hooks ya existentes de Clientes/Servicios — solo
  // para resolver nombres, no se crea ninguna llamada nueva a esas APIs.
  const { data: clientes } = useClientes({ solo_activos: false, limit: 200 });
  const { data: servicios } = useServicios({ solo_activos: false, limit: 200 });

  const nombreCliente = React.useCallback(
    (id: number) => clientes?.find((c) => c.id === id)?.nombre ?? `Cliente #${id}`,
    [clientes]
  );
  const nombreServicio = React.useCallback(
    (id: number) => servicios?.find((s) => s.id === id)?.nombre ?? `Servicio #${id}`,
    [servicios]
  );

  /**
   * Búsqueda de texto: el backend no soporta un filtro de texto libre
   * (solo estado/servicio_id/fechas) — se filtra en el navegador sobre
   * los nombres ya resueltos de cliente/servicio y las notas. Misma
   * decisión documentada en Clientes y Servicios (docs/entrega-3a.md).
   */
  const reservacionesFiltradas = React.useMemo(() => {
    const texto = busquedaDebounced.trim().toLowerCase();
    if (!texto) return reservaciones ?? [];
    return (reservaciones ?? []).filter((r) =>
      [nombreCliente(r.cliente_id), nombreServicio(r.servicio_id), r.notas]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(texto))
    );
  }, [reservaciones, busquedaDebounced, nombreCliente, nombreServicio]);

  const solicitarTransicion = (reservacion: Reservacion, nuevoEstado: EstadoReservacion, label: string) => {
    if (nuevoEstado === "cancelada") {
      // Cancelar es irreversible — siempre pide confirmación.
      setTransicionPendiente({ reservacion, nuevoEstado, label });
      return;
    }
    ejecutarTransicion(reservacion, nuevoEstado);
  };

  const ejecutarTransicion = (reservacion: Reservacion, nuevoEstado: EstadoReservacion) => {
    cambiarEstado.mutate(
      { id: reservacion.id, nuevoEstado },
      {
        onSuccess: () => {
          toast({ title: `Reservación actualizada a "${nuevoEstado}"`, variant: "success" });
          setTransicionPendiente(null);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          toast({
            title: "No se pudo cambiar el estado",
            description: typeof detail === "string" ? detail : "Intenta de nuevo.",
            variant: "error",
          });
          setTransicionPendiente(null);
        },
      }
    );
  };

  const columnas: DataTableColumn<Reservacion>[] = [
    { header: "Cliente", cell: (r) => nombreCliente(r.cliente_id) },
    { header: "Servicio", cell: (r) => nombreServicio(r.servicio_id) },
    { header: "Fecha visita", cell: (r) => r.fecha_visita },
    { header: "Personas", cell: (r) => r.num_personas },
    { header: "Estado", cell: (r) => <EstadoBadge estado={r.estado} /> },
    {
      header: "Saldo",
      cell: (r) => (
        <span className="font-mono">
          {formatearMoneda(r.saldo_pendiente)}
          <span className="text-xs text-muted-foreground"> / {formatearMoneda(r.total)}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Reservaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona las reservaciones del parque.</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva reservación
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, servicio o notas..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {ESTADOS_RESERVACION.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Servicio</label>
          <Select value={filtroServicio} onValueChange={setFiltroServicio}>
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
          <label className="text-xs font-medium text-muted-foreground">Desde</label>
          <Input type="date" className="w-40" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Hasta</label>
          <Input type="date" className="w-40" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
      </div>

      {isLoading && <TableSkeleton columnas={6} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && reservacionesFiltradas.length === 0 && (
        <EmptyState
          titulo={busqueda ? "Sin resultados" : "No hay reservaciones con estos filtros"}
          descripcion={
            busqueda
              ? "Ninguna reservación coincide con tu búsqueda."
              : "Ajusta los filtros o crea la primera reservación."
          }
          accion={
            <Button onClick={() => setModalAbierto(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva reservación
            </Button>
          }
        />
      )}

      {!isLoading && !isError && reservacionesFiltradas.length > 0 && (
        <DataTable
          columns={columnas}
          data={reservacionesFiltradas}
          getRowId={(r) => r.id}
          renderAcciones={(r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => setPagoReservacionId(r.id)}>
                <Wallet className="mr-1 h-4 w-4" />
                Pagos
              </Button>
              {accionesDisponibles(r.estado).map((accion) => (
                <Button
                  key={accion.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => solicitarTransicion(r, accion.nuevoEstado, accion.label)}
                  className={accion.destructiva ? "text-destructive" : ""}
                >
                  <accion.Icon className="mr-1 h-4 w-4" />
                  {accion.label}
                </Button>
              ))}
            </div>
          )}
        />
      )}

      <ReservacionFormModal open={modalAbierto} onOpenChange={setModalAbierto} />

      {pagoReservacionId !== null && (
        <PagoModal
          open={pagoReservacionId !== null}
          onOpenChange={(open) => !open && setPagoReservacionId(null)}
          reservacionId={pagoReservacionId}
          reservacionContexto={(reservaciones ?? []).find((r) => r.id === pagoReservacionId)}
        />
      )}

      <ConfirmDialog
        open={transicionPendiente !== null}
        onOpenChange={(open) => !open && setTransicionPendiente(null)}
        titulo="¿Cancelar esta reservación?"
        descripcion={
          transicionPendiente
            ? `La reservación de ${nombreCliente(transicionPendiente.reservacion.cliente_id)} pasará a estado "cancelada". Esta acción no se puede deshacer.`
            : ""
        }
        textoConfirmar="Cancelar reservación"
        variante="destructive"
        cargando={cambiarEstado.isPending}
        onConfirmar={() =>
          transicionPendiente &&
          ejecutarTransicion(transicionPendiente.reservacion, transicionPendiente.nuevoEstado)
        }
      />
    </div>
  );
}
