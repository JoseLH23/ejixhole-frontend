import * as React from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  FlagTriangleRight,
  Wallet,
  Globe,
  Building2,
  Loader2,
  CalendarCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, EstadoBadge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useDebounce } from "@/hooks/useDebounce";
import { formatearMoneda } from "@/lib/format";
import { useClientes } from "@/features/clientes/useClientes";
import { useServicios } from "@/features/servicios/useServicios";
import { useReservaciones, useCambiarEstadoReservacion } from "./useReservaciones";
import { ReservacionFormModal } from "./ReservacionFormModal";
import { PagoModal } from "@/features/pagos/PagoModal";
import {
  ESTADOS_RESERVACION,
  type EstadoReservacion,
  type OrigenReservacion,
  type Reservacion,
} from "@/types/reservacion";

const FILTRO_TODOS = "todos";

const TIPO_LABELS: Record<string, string> = {
  entrada: "Entrada",
  camping: "Camping",
  hospedaje: "Hospedaje",
};

/**
 * Formatea una fecha "YYYY-MM-DD" como "15 ago" (es-MX, corta) sin
 * depender de un helper compartido nuevo — es una necesidad puntual
 * de esta tabla/tarjetas, no de otro módulo todavía.
 */
function formatearFechaCorta(fecha: string | null): string {
  if (!fecha) return "—";
  const partes = `${fecha}T00:00:00`;
  const d = new Date(partes);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

/**
 * Rango de fechas de la reservación. "entrada" es un solo día
 * (llegada === salida); camping/hospedaje muestran el rango completo.
 * Si por alguna razón fecha_llegada viene vacía (datos antiguos),
 * cae de vuelta a fecha_visita — misma lógica que ya usa el backend
 * en app/services/notificacion_service.py.
 */
function formatearRangoFechas(r: Reservacion): string {
  const llegada = r.fecha_llegada ?? r.fecha_visita;
  const salida = r.fecha_salida;
  if (!salida || salida === llegada) {
    return formatearFechaCorta(llegada);
  }
  return `${formatearFechaCorta(llegada)} → ${formatearFechaCorta(salida)}`;
}

/**
 * Distingue visualmente si la reservación llegó del portal público
 * (visitante, sin intervención de personal) o fue registrada
 * internamente (recepción/recepción express/teléfono). Basado en el
 * campo real `origen` del backend (app/models/reservacion.py,
 * ORIGENES_RESERVACION) — no se inventa ninguna heurística nueva.
 */
function OrigenBadge({ origen }: { origen: OrigenReservacion }) {
  if (origen === "portal") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Globe className="h-3 w-3" />
        Portal público
      </Badge>
    );
  }
  const label =
    origen === "recepcion" ? "Recepción" : origen === "recepcion_express" ? "Recepción express" : "Teléfono";
  return (
    <Badge variant="outline" className="gap-1">
      <Building2 className="h-3 w-3" />
      {label}
    </Badge>
  );
}

interface Accion {
  label: string;
  nuevoEstado: EstadoReservacion;
  Icon: typeof CheckCircle2;
  destructiva: boolean;
}

/**
 * Transiciones de estado válidas según ReservacionService.cambiar_estado
 * en el backend: nunca desde un estado terminal (completada/cancelada),
 * nunca al mismo estado. Se listan aquí solo las que tienen sentido de
 * negocio (no se ofrece "volver a pendiente", por ejemplo).
 *
 * Para solicitudes pendientes que vinieron del portal público, el
 * lenguaje cambia a "Aceptar"/"Rechazar" (son solicitudes de un
 * visitante que el parque debe revisar) en vez de "Confirmar"/
 * "Cancelar" (reservaciones ya capturadas por el personal). La
 * transición de estado en el backend es idéntica en ambos casos —
 * solo cambia la etiqueta mostrada.
 */
function accionesDisponibles(r: Reservacion): Accion[] {
  const esSolicitudPortal = r.origen === "portal" && r.estado === "pendiente";

  if (r.estado === "pendiente") {
    return [
      {
        label: esSolicitudPortal ? "Aceptar" : "Confirmar",
        nuevoEstado: "confirmada",
        Icon: CheckCircle2,
        destructiva: false,
      },
      {
        label: esSolicitudPortal ? "Rechazar" : "Cancelar",
        nuevoEstado: "cancelada",
        Icon: XCircle,
        destructiva: true,
      },
    ];
  }
  if (r.estado === "confirmada") {
    return [
      { label: "Completar", nuevoEstado: "completada", Icon: FlagTriangleRight, destructiva: false },
      { label: "Cancelar", nuevoEstado: "cancelada", Icon: XCircle, destructiva: true },
    ];
  }
  return []; // completada/cancelada: estados terminales, sin acciones
}

export function ReservacionesListPage() {
  const { toast } = useToast();
  const mostrarError = useErrorToast();

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

  // Fila actualmente en proceso (si alguna) — se usa para deshabilitar
  // sus botones y mostrar "Procesando..." sin bloquear el resto de la
  // tabla. `cambiarEstado.isPending` además deshabilita TODAS las
  // acciones de cambio de estado mientras haya una en curso, para
  // evitar doble clic / solicitudes duplicadas por cualquier fila.
  const idEnProceso = cambiarEstado.isPending ? cambiarEstado.variables?.id ?? null : null;

  const solicitarTransicion = (reservacion: Reservacion, nuevoEstado: EstadoReservacion, label: string) => {
    if (cambiarEstado.isPending) return; // ya hay una transición en curso — ignora el clic
    if (nuevoEstado === "cancelada") {
      // Cancelar/Rechazar es irreversible — siempre pide confirmación.
      setTransicionPendiente({ reservacion, nuevoEstado, label });
      return;
    }
    ejecutarTransicion(reservacion, nuevoEstado);
  };

  const ejecutarTransicion = (reservacion: Reservacion, nuevoEstado: EstadoReservacion) => {
    if (cambiarEstado.isPending) return;
    cambiarEstado.mutate(
      { id: reservacion.id, nuevoEstado },
      {
        onSuccess: () => {
          toast({ title: `Reservación actualizada a "${nuevoEstado}"`, variant: "success" });
          setTransicionPendiente(null);
        },
        onError: (error) => {
          mostrarError(error, "No se pudo cambiar el estado");
          setTransicionPendiente(null);
        },
      }
    );
  };

  const renderAccionesFila = (r: Reservacion) => {
    const procesandoEstaFila = idEnProceso === r.id;
    return (
      <div className="flex flex-wrap justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPagoReservacionId(r.id)}
          disabled={cambiarEstado.isPending}
        >
          <Wallet className="mr-1 h-4 w-4" />
          Pagos
        </Button>
        {accionesDisponibles(r).map((accion) => (
          <Button
            key={accion.label}
            variant="ghost"
            size="sm"
            onClick={() => solicitarTransicion(r, accion.nuevoEstado, accion.label)}
            disabled={cambiarEstado.isPending}
            className={accion.destructiva ? "text-destructive" : ""}
          >
            {procesandoEstaFila ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <accion.Icon className="mr-1 h-4 w-4" />
            )}
            {procesandoEstaFila ? "Procesando..." : accion.label}
          </Button>
        ))}
      </div>
    );
  };

  const columnas: DataTableColumn<Reservacion>[] = [
    { header: "Cliente", cell: (r) => nombreCliente(r.cliente_id) },
    { header: "Folio", cell: (r) => <span className="font-mono text-xs">#{r.id}</span> },
    { header: "Tipo", cell: (r) => TIPO_LABELS[r.tipo_reservacion] ?? r.tipo_reservacion },
    { header: "Fechas", cell: (r) => <span className="whitespace-nowrap">{formatearRangoFechas(r)}</span> },
    { header: "Personas", cell: (r) => r.num_personas },
    {
      header: "Total",
      cell: (r) => (
        <span className="font-mono">
          {formatearMoneda(r.saldo_pendiente)}
          <span className="text-xs text-muted-foreground"> / {formatearMoneda(r.total)}</span>
        </span>
      ),
    },
    { header: "Estado", cell: (r) => <EstadoBadge estado={r.estado} /> },
    { header: "Origen", cell: (r) => <OrigenBadge origen={r.origen} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Reservaciones"
        descripcion="Gestiona las reservaciones del parque."
        icon={CalendarCheck}
        acento="secondary"
        fotoUrl="https://ejixhole-reservas.vercel.app/gallery/hero-principal.jpg"
        fotoAlt="Cascada de EjiXhole"
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva reservación
          </Button>
        }
      />

      <FilterBar>
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
      </FilterBar>

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
          renderAcciones={renderAccionesFila}
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
        titulo={transicionPendiente?.reservacion.origen === "portal" ? "¿Rechazar esta solicitud?" : "¿Cancelar esta reservación?"}
        descripcion={
          transicionPendiente
            ? transicionPendiente.reservacion.origen === "portal"
              ? `La solicitud del portal público de ${nombreCliente(transicionPendiente.reservacion.cliente_id)} pasará a estado "cancelada" y no se le asignará el servicio. Esta acción no se puede deshacer.`
              : `La reservación de ${nombreCliente(transicionPendiente.reservacion.cliente_id)} pasará a estado "cancelada". Esta acción no se puede deshacer.`
            : ""
        }
        textoConfirmar={transicionPendiente?.reservacion.origen === "portal" ? "Rechazar solicitud" : "Cancelar reservación"}
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
