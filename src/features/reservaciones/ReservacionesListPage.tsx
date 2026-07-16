import * as React from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  UsersRound,
  Wallet,
  XCircle,
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

function siguientePaso(r: Reservacion): string {
  if (r.estado === "pendiente") {
    return r.origen === "portal" ? "Revisar solicitud" : "Confirmar reservación";
  }
  if (r.estado === "confirmada") return "Registrar llegada";
  if (r.estado === "en_curso" && !r.pago_completo) return "Cobrar saldo antes de salida";
  if (r.estado === "en_curso" && r.pago_completo) return "Registrar salida";
  if (r.estado === "completada") return "Visita finalizada";
  return "Sin acciones pendientes";
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
  const [soloSaldoPendiente, setSoloSaldoPendiente] = React.useState(false);
  const busquedaDebounced = useDebounce(busqueda);

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [reservacionEditar, setReservacionEditar] = React.useState<Reservacion | null>(null);
  const [pagoReservacionId, setPagoReservacionId] = React.useState<number | null>(null);
  const [confirmacion, setConfirmacion] = React.useState<Confirmacion>(null);

  const rangoFechasInvalido = Boolean(fechaDesde && fechaHasta && fechaHasta < fechaDesde);
  const filtrosServidor = {
    estado: filtroEstado === FILTRO_TODOS ? undefined : (filtroEstado as EstadoReservacion),
    servicio_id: filtroServicio === FILTRO_TODOS ? undefined : Number(filtroServicio),
    fecha_desde: rangoFechasInvalido ? undefined : fechaDesde || undefined,
    fecha_hasta: rangoFechasInvalido ? undefined : fechaHasta || undefined,
  };

  const { data: reservaciones, isLoading, isError, error, refetch, isFetching } = useReservaciones(filtrosServidor);
  const resumenQuery = useReservaciones({ limit: 200 });
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

  const resumenOperativo = React.useMemo(() => {
    const todas = resumenQuery.data ?? [];
    return {
      porRevisar: todas.filter((r) => r.estado === "pendiente").length,
      llegadas: todas.filter((r) => r.estado === "confirmada").length,
      enParque: todas.filter((r) => r.estado === "en_curso").length,
      saldoPendiente: todas.filter((r) => r.estado === "en_curso" && !r.pago_completo).length,
    };
  }, [resumenQuery.data]);

  const reservacionesFiltradas = React.useMemo(() => {
    const texto = busquedaDebounced.trim().toLowerCase();
    return (reservaciones ?? []).filter((r) => {
      if (soloSaldoPendiente && !(r.estado === "en_curso" && !r.pago_completo)) return false;
      if (!texto) return true;
      return [String(r.id), nombreCliente(r.cliente_id), nombreServicio(r.servicio_id), r.notas]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(texto));
    });
  }, [reservaciones, busquedaDebounced, soloSaldoPendiente, nombreCliente, nombreServicio]);

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    filtroEstado !== FILTRO_TODOS ||
    filtroServicio !== FILTRO_TODOS ||
    fechaDesde !== "" ||
    fechaHasta !== "" ||
    soloSaldoPendiente;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado(FILTRO_TODOS);
    setFiltroServicio(FILTRO_TODOS);
    setFechaDesde("");
    setFechaHasta("");
    setSoloSaldoPendiente(false);
  };

  const aplicarFiltroRapido = (estado: EstadoReservacion, soloSaldo = false) => {
    setFiltroEstado(estado);
    setSoloSaldoPendiente(soloSaldo);
  };

  const mutacionEnCurso = cambiarEstado.isPending || checkIn.isPending || checkOut.isPending;

  const confirmarReservacion = (r: Reservacion) => {
    cambiarEstado.mutate(
      { id: r.id, nuevoEstado: "confirmada" },
      {
        onSuccess: () =>
          toast({
            title: r.origen === "portal" ? "Solicitud aceptada" : "Reservación confirmada",
            description: `El siguiente paso de la reservación #${r.id} es registrar la llegada.`,
            variant: "success",
          }),
        onError: (e) => mostrarError(e, "No se pudo confirmar"),
      }
    );
  };

  const registrarCheckIn = (r: Reservacion) => {
    checkIn.mutate(r.id, {
      onSuccess: () =>
        toast({
          title: "Check-in registrado",
          description: r.pago_completo
            ? `La visita #${r.id} está en curso y lista para su salida.`
            : `La visita #${r.id} está en curso; queda saldo pendiente antes del check-out.`,
          variant: "success",
        }),
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
            toast({
              title: r.origen === "portal" ? "Solicitud rechazada" : "Reservación cancelada",
              description: `La reservación #${r.id} ya no requiere acciones operativas.`,
              variant: "success",
            });
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
        toast({
          title: "Check-out registrado",
          description: `La visita #${r.id} quedó completada sin saldo pendiente.`,
          variant: "success",
        });
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
      <div className="flex w-full flex-wrap justify-end gap-1.5">
        {r.estado === "pendiente" && (
          <Button size="sm" onClick={() => confirmarReservacion(r)} disabled={mutacionEnCurso}>
            {cambiarEstado.isPending && cambiarEstado.variables?.id === r.id ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1 h-4 w-4" />
            )}
            {r.origen === "portal" ? "Aceptar" : "Confirmar"}
          </Button>
        )}

        {r.estado === "confirmada" && (
          <Button size="sm" onClick={() => registrarCheckIn(r)} disabled={mutacionEnCurso}>
            {checkIn.isPending && checkIn.variables === r.id ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-1 h-4 w-4" />
            )}
            Check-in
          </Button>
        )}

        {r.estado === "en_curso" && r.pago_completo && (
          <Button
            size="sm"
            onClick={() => setConfirmacion({ tipo: "checkout", reservacion: r })}
            disabled={mutacionEnCurso}
          >
            <LogOut className="mr-1 h-4 w-4" /> Check-out
          </Button>
        )}

        {r.estado === "en_curso" && !r.pago_completo && (
          <Button size="sm" onClick={() => setPagoReservacionId(r.id)} disabled={mutacionEnCurso}>
            <CircleDollarSign className="mr-1 h-4 w-4" /> Cobrar saldo
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => setPagoReservacionId(r.id)} disabled={mutacionEnCurso}>
          <Wallet className="mr-1 h-4 w-4" /> Pagos
        </Button>

        {editable && (
          <Button variant="ghost" size="sm" onClick={() => setReservacionEditar(r)} disabled={mutacionEnCurso}>
            <Pencil className="mr-1 h-4 w-4" /> Editar
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
            <XCircle className="mr-1 h-4 w-4" />
            {r.origen === "portal" && r.estado === "pendiente" ? "Rechazar" : "Cancelar"}
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
        <span className={r.pago_completo ? "font-mono text-success" : "font-mono"}>
          {formatearMoneda(r.saldo_pendiente)}
          <span className="text-xs text-muted-foreground"> / {formatearMoneda(r.total)}</span>
        </span>
      ),
    },
    { header: "Estado", cell: (r) => <EstadoBadge estado={r.estado} /> },
    {
      header: "Siguiente paso",
      cell: (r) => (
        <span className={r.estado === "completada" || r.estado === "cancelada" ? "text-xs text-muted-foreground" : "inline-flex items-center gap-1 text-xs font-medium"}>
          {r.estado !== "completada" && r.estado !== "cancelada" && <ArrowRight className="h-3.5 w-3.5" />}
          {siguientePaso(r)}
        </span>
      ),
    },
    { header: "Origen", cell: (r) => <OrigenBadge origen={r.origen} /> },
  ];

  const numeroResumen = (valor: number) => (resumenQuery.isLoading ? "—" : String(valor));

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Reservaciones"
        descripcion="Revisa solicitudes, cobra saldos y registra llegadas y salidas sin perder el siguiente paso."
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

      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">Flujo de una visita:</span>
          <Badge variant="pendiente">Pendiente</Badge>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="confirmada">Confirmada</Badge>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="en_curso">En curso</Badge>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="completada">Completada</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          aria-pressed={filtroEstado === "pendiente" && !soloSaldoPendiente}
          onClick={() => aplicarFiltroRapido("pendiente")}
          className={`rounded-xl border p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] ${
            filtroEstado === "pendiente" && !soloSaldoPendiente ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <Clock3 className="h-5 w-5 text-warning" />
            <span className="text-2xl font-semibold">{numeroResumen(resumenOperativo.porRevisar)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">Por revisar</p>
          <p className="text-xs text-muted-foreground">Solicitudes pendientes de aceptar o rechazar.</p>
        </button>

        <button
          type="button"
          aria-pressed={filtroEstado === "confirmada" && !soloSaldoPendiente}
          onClick={() => aplicarFiltroRapido("confirmada")}
          className={`rounded-xl border p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] ${
            filtroEstado === "confirmada" && !soloSaldoPendiente ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span className="text-2xl font-semibold">{numeroResumen(resumenOperativo.llegadas)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">Llegadas pendientes</p>
          <p className="text-xs text-muted-foreground">Reservaciones confirmadas listas para check-in.</p>
        </button>

        <button
          type="button"
          aria-pressed={filtroEstado === "en_curso" && !soloSaldoPendiente}
          onClick={() => aplicarFiltroRapido("en_curso")}
          className={`rounded-xl border p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] ${
            filtroEstado === "en_curso" && !soloSaldoPendiente ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <UsersRound className="h-5 w-5 text-secondary" />
            <span className="text-2xl font-semibold">{numeroResumen(resumenOperativo.enParque)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">En el parque</p>
          <p className="text-xs text-muted-foreground">Visitas con check-in que todavía no terminan.</p>
        </button>

        <button
          type="button"
          aria-pressed={soloSaldoPendiente}
          onClick={() => aplicarFiltroRapido("en_curso", true)}
          className={`rounded-xl border p-4 text-left transition-colors hover:border-warning/60 hover:bg-warning/[0.04] ${
            soloSaldoPendiente ? "border-warning bg-warning/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <CircleDollarSign className="h-5 w-5 text-warning" />
            <span className="text-2xl font-semibold">{numeroResumen(resumenOperativo.saldoPendiente)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">Saldo por cobrar</p>
          <p className="text-xs text-muted-foreground">Visitas en curso que no pueden cerrar todavía.</p>
        </button>
      </div>

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
          <Select
            value={filtroEstado}
            onValueChange={(valor) => {
              setFiltroEstado(valor);
              setSoloSaldoPendiente(false);
            }}
          >
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

        {hayFiltrosActivos && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="self-end">
            <RotateCcw className="mr-1 h-4 w-4" /> Limpiar filtros
          </Button>
        )}
      </FilterBar>

      {rangoFechasInvalido && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          La fecha “Hasta” no puede ser anterior a “Desde”. Corrige el rango para aplicar el filtro.
        </div>
      )}

      {isLoading && <TableSkeleton columnas={9} />}
      {isError && !isLoading && (
        <ErrorState
          titulo="No se pudieron cargar las reservaciones"
          error={error}
          onRetry={() => {
            void refetch();
            void resumenQuery.refetch();
          }}
          retrying={isFetching}
        />
      )}
      {!isLoading && !isError && reservacionesFiltradas.length === 0 && (
        <EmptyState
          titulo={hayFiltrosActivos ? "No hay reservaciones con estos filtros" : "Todavía no hay reservaciones"}
          descripcion={
            hayFiltrosActivos
              ? "Limpia o ajusta los filtros para volver a mostrar la operación."
              : "Crea la primera reservación o espera una solicitud del portal público."
          }
          accion={
            hayFiltrosActivos ? (
              <Button onClick={limpiarFiltros} size="sm" variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Limpiar filtros
              </Button>
            ) : (
              <Button onClick={() => setModalAbierto(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Nueva reservación
              </Button>
            )
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
        titulo={
          confirmacion?.tipo === "checkout"
            ? "¿Registrar check-out?"
            : confirmacion?.reservacion.origen === "portal"
              ? "¿Rechazar esta solicitud?"
              : "¿Cancelar esta reservación?"
        }
        descripcion={
          confirmacion?.tipo === "checkout"
            ? `La visita #${confirmacion.reservacion.id} quedará completada. El sistema ya verificó que no existe saldo pendiente.`
            : confirmacion
              ? `La reservación de ${nombreCliente(confirmacion.reservacion.cliente_id)} quedará cancelada. Esta acción no se puede deshacer.`
              : ""
        }
        textoConfirmar={
          confirmacion?.tipo === "checkout"
            ? "Completar visita"
            : confirmacion?.reservacion.origen === "portal"
              ? "Rechazar solicitud"
              : "Cancelar reservación"
        }
        variante={confirmacion?.tipo === "checkout" ? "default" : "destructive"}
        cargando={mutacionEnCurso}
        onConfirmar={ejecutarConfirmacion}
      />
    </div>
  );
}
