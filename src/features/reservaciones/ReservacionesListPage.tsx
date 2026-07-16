import * as React from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Wallet,
  Globe,
  Building2,
  Loader2,
  CalendarCheck,
  Pencil,
  LogIn,
  LogOut,
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
import {
  useReservaciones,
  useCambiarEstadoReservacion,
  useCheckInReservacion,
  useCheckOutReservacion,
} from "./useReservaciones";
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

const ESTADO_LABELS: Record<EstadoReservacion, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
};

function formatearFechaCorta(fecha: string | null): string {
  if (!fecha) return "—";
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function formatearRangoFechas(r: Reservacion): string {
  const llegada = r.fecha_llegada ?? r.fecha_visita;
  const salida = r.fecha_salida;
  if (!salida || salida === llegada) return formatearFechaCorta(llegada);
  return `${formatearFechaCorta(llegada)} → ${formatearFechaCorta(salida)}`;
}

function OrigenBadge({ origen }: { origen: OrigenReservacion }) {
  if (origen === "portal") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Globe className="h-3 w-3" /> Portal público
      </Badge>
    );
  }
  const label =
    origen === "recepcion" ? "Recepción" : origen === "recepcion_express" ? "Recepción express" : "Teléfono";
  return (
    <Badge variant="outline" className="gap-1">
      <Building2 className="h-3 w-3" /> {label}
    </Badge>
  );
}

type Confirmacion = {
  tipo: "cancelar" | "checkout";
  reservacion: Reservacion;
} | null;

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
  const [reservacionEditar, setReservacionEditar] = React.useState<Reservacion | null>(null);
  const [pagoReservacionId, setPagoReservacionId] = React.useState<number | null>(null);
  const [confirmacion, setConfirmacion] = React.useState<Confirmacion>(null);

  const filtrosServidor = {
    estado: filtroEstado === FILTRO_TODOS ? undefined : (filtroEstado as EstadoReservacion),
    servicio_id: filtroServicio === FILTRO_TODOS ? undefined : Number(filtroServicio),
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
  };

  const { data: reservaciones, isLoading, isError, error, refetch, isFetching } = useReservaciones(filtrosServidor);
  const cambiarEstado = useCambiarEstadoReservacion();
  const checkIn = useCheckInReservacion();
  const checkOut = useCheckOutReservacion();

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

  const reservacionesFiltradas = React.useMemo(() => {
    const texto = busquedaDebounced.trim().toLowerCase();
    if (!texto) return reservaciones ?? [];
    return (reservaciones ?? []).filter((r) =>
      [String(r.id), nombreCliente(r.cliente_id), nombreServicio(r.servicio_id), r.notas]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(texto))
    );
  }, [reservaciones, busquedaDebounced, nombreCliente, nombreServicio]);

  const mutacionEnCurso = cambiarEstado.isPending || checkIn.isPending || checkOut.isPending;

  const confirmarReservacion = (r: Reservacion) => {
    cambiarEstado.mutate(
      { id: r.id, nuevoEstado: "confirmada" },
      {
        onSuccess: () => toast({ title: r.origen === "portal" ? "Solicitud aceptada" : "Reservación confirmada", variant: "success" }),
        onError: (e) => mostrarError(e, "No se pudo confirmar"),
      }
    );
  };

  const registrarCheckIn = (r: Reservacion) => {
    checkIn.mutate(r.id, {
      onSuccess: () => toast({ title: "Check-in registrado", descripcion: `La visita #${r.id} está en curso.`, variant: "success" }),
      onError: (e) => mostrarError(e, "No se pudo registrar el check-in"),
    });
  };

  const ejecutarConfirmacion = () => {
    if (!confirmacion) return;
    const r = confirmacion.reservacion;
    if (confirmacion.tipo === "cancelar") {
      cambiarEstado.mutate(
        { id: r.id, nuevoEstado: "cancelada" },
        {
          onSuccess: () => {
            toast({ title: r.origen === "portal" ? "Solicitud rechazada" : "Reservación cancelada", variant: "success" });
            setConfirmacion(null);
          },
          onError: (e) => {
            mostrarError(e, "No se pudo cancelar");
            setConfirmacion(null);
          },
        }
      );
      return;
    }

    checkOut.mutate(r.id, {
      onSuccess: () => {
        toast({ title: "Check-out registrado", descripcion: "La visita quedó completada.", variant: "success" });
        setConfirmacion(null);
      },
      onError: (e) => {
        mostrarError(e, "No se pudo registrar el check-out");
        setConfirmacion(null);
      },
    });
  };

  const renderAccionesFila = (r: Reservacion) => {
    const editable = r.estado === "pendiente" || r.estado === "confirmada";
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {editable && (
          <Button variant="ghost" size="sm" onClick={() => setReservacionEditar(r)} disabled={mutacionEnCurso}>
            <Pencil className="mr-1 h-4 w-4" /> Editar
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={() => setPagoReservacionId(r.id)} disabled={mutacionEnCurso}>
          <Wallet className="mr-1 h-4 w-4" /> Pagos
        </Button>

        {r.estado === "pendiente" && (
          <Button variant="ghost" size="sm" onClick={() => confirmarReservacion(r)} disabled={mutacionEnCurso}>
            {cambiarEstado.isPending && cambiarEstado.variables?.id === r.id ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1 h-4 w-4" />
            )}
            {r.origen === "portal" ? "Aceptar" : "Confirmar"}
          </Button>
        )}

        {r.estado === "confirmada" && (
          <Button variant="ghost" size="sm" onClick={() => registrarCheckIn(r)} disabled={mutacionEnCurso}>
            {checkIn.isPending && checkIn.variables === r.id ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-1 h-4 w-4" />
            )}
            Check-in
          </Button>
        )}

        {r.estado === "en_curso" && r.pago_completo && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmacion({ tipo: "checkout", reservacion: r })} disabled={mutacionEnCurso}>
            <LogOut className="mr-1 h-4 w-4" /> Check-out
          </Button>
        )}

        {r.estado === "en_curso" && !r.pago_completo && (
          <Button variant="ghost" size="sm" className="text-warning" onClick={() => setPagoReservacionId(r.id)} disabled={mutacionEnCurso}>
            <Wallet className="mr-1 h-4 w-4" /> Cobrar saldo
          </Button>
        )}

        {(r.estado === "pendiente" || r.estado === "confirmada") && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setConfirmacion({ tipo: "cancelar", reservacion: r })}
            disabled={mutacionEnCurso}
          >
            <XCircle className="mr-1 h-4 w-4" /> {r.origen === "portal" && r.estado === "pendiente" ? "Rechazar" : "Cancelar"}
          </Button>
        )}
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
      header: "Saldo / Total",
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
        descripcion="Reservación, cobro, llegada y salida en un solo flujo."
        icon={CalendarCheck}
        acento="secondary"
        fotoUrl="https://ejixhole-reservas.vercel.app/gallery/hero-principal.jpg"
        fotoAlt="Cascada de EjiXhole"
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva reservación
          </Button>
        }
      />

      <FilterBar>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por folio, cliente, servicio o notas..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {ESTADOS_RESERVACION.map((estado) => (
                <SelectItem key={estado} value={estado}>{ESTADO_LABELS[estado]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Servicio</label>
          <Select value={filtroServicio} onValueChange={setFiltroServicio}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {servicios?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}
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

      {isLoading && <TableSkeleton columnas={8} />}
      {isError && !isLoading && <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />}
      {!isLoading && !isError && reservacionesFiltradas.length === 0 && (
        <EmptyState
          titulo={busqueda ? "Sin resultados" : "No hay reservaciones con estos filtros"}
          descripcion={busqueda ? "Ninguna reservación coincide con tu búsqueda." : "Ajusta los filtros o crea una reservación."}
          accion={<Button onClick={() => setModalAbierto(true)} size="sm"><Plus className="mr-2 h-4 w-4" /> Nueva reservación</Button>}
        />
      )}
      {!isLoading && !isError && reservacionesFiltradas.length > 0 && (
        <DataTable columns={columnas} data={reservacionesFiltradas} getRowId={(r) => r.id} renderAcciones={renderAccionesFila} />
      )}

      <ReservacionFormModal
        open={modalAbierto || reservacionEditar !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModalAbierto(false);
            setReservacionEditar(null);
          }
        }}
        reservacionEditar={reservacionEditar}
      />

      {pagoReservacionId !== null && (
        <PagoModal
          open
          onOpenChange={(open) => !open && setPagoReservacionId(null)}
          reservacionId={pagoReservacionId}
          reservacionContexto={(reservaciones ?? []).find((r) => r.id === pagoReservacionId)}
        />
      )}

      <ConfirmDialog
        open={confirmacion !== null}
        onOpenChange={(open) => !open && setConfirmacion(null)}
        titulo={confirmacion?.tipo === "checkout" ? "¿Registrar check-out?" : confirmacion?.reservacion.origen === "portal" ? "¿Rechazar esta solicitud?" : "¿Cancelar esta reservación?"}
        descripcion={
          confirmacion?.tipo === "checkout"
            ? `La visita #${confirmacion.reservacion.id} quedará completada. El sistema ya verificó que no existe saldo pendiente.`
            : confirmacion
              ? `La reservación de ${nombreCliente(confirmacion.reservacion.cliente_id)} quedará cancelada. Esta acción no se puede deshacer.`
              : ""
        }
        textoConfirmar={confirmacion?.tipo === "checkout" ? "Completar visita" : confirmacion?.reservacion.origen === "portal" ? "Rechazar solicitud" : "Cancelar reservación"}
        variante={confirmacion?.tipo === "checkout" ? "default" : "destructive"}
        cargando={mutacionEnCurso}
        onConfirmar={ejecutarConfirmacion}
      />
    </div>
  );
}
