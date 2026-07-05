import * as React from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { FilterBar } from "@/components/shared/FilterBar";
import { useDebounce } from "@/hooks/useDebounce";
import { formatearMoneda } from "@/lib/format";
import { useReservaciones } from "@/features/reservaciones/useReservaciones";
import { usePagos } from "./usePagos";
import { PagoModal } from "./PagoModal";
import { SeleccionarReservacionModal } from "./SeleccionarReservacionModal";
import { METODOS_PAGO, TIPOS_PAGO, type MetodoPago, type Pago, type TipoPago } from "@/types/pago";

const FILTRO_TODOS = "todos";

const TIPO_LABELS: Record<string, string> = {
  anticipo: "Anticipo",
  pago_completo: "Pago completo",
  pago_saldo: "Pago de saldo",
  reembolso: "Reembolso",
};

const METODO_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

export function PagosListPage() {
  const [filtroTipo, setFiltroTipo] = React.useState<string>(FILTRO_TODOS);
  const [filtroMetodo, setFiltroMetodo] = React.useState<string>(FILTRO_TODOS);
  const [busqueda, setBusqueda] = React.useState("");
  const busquedaDebounced = useDebounce(busqueda);

  const [pasoSeleccion, setPasoSeleccion] = React.useState(false);
  const [reservacionIdActivo, setReservacionIdActivo] = React.useState<number | null>(null);

  const filtros = {
    tipo: filtroTipo === FILTRO_TODOS ? undefined : (filtroTipo as TipoPago),
    metodo_pago: filtroMetodo === FILTRO_TODOS ? undefined : (filtroMetodo as MetodoPago),
  };

  const { data: pagos, isLoading, isError, error, refetch, isFetching } = usePagos(filtros);

  // Se reutiliza para resolver "Reservación #N" a algo más útil en la
  // bitácora cuando el rol sí tiene acceso (admin). Si no (cajero,
  // 403), simplemente se muestra el número — no rompe la página.
  const reservacionesQuery = useReservaciones({});
  const reservacionesDisponibles = reservacionesQuery.isError ? undefined : reservacionesQuery.data;

  const pagosFiltrados = React.useMemo(() => {
    const texto = busquedaDebounced.trim().toLowerCase();
    if (!texto) return pagos ?? [];
    return (pagos ?? []).filter((p) => {
      const referencia = p.referencia?.toLowerCase() ?? "";
      const notas = p.notas?.toLowerCase() ?? "";
      return referencia.includes(texto) || notas.includes(texto) || String(p.reservacion_id).includes(texto);
    });
  }, [pagos, busquedaDebounced]);

  const columnas: DataTableColumn<Pago>[] = [
    {
      header: "Reservación",
      cell: (p) => {
        const reservacion = reservacionesDisponibles?.find((r) => r.id === p.reservacion_id);
        return reservacion ? `#${p.reservacion_id} — ${reservacion.fecha_visita}` : `#${p.reservacion_id}`;
      },
    },
    { header: "Monto", cell: (p) => <span className="font-mono">{formatearMoneda(p.monto)}</span> },
    { header: "Tipo", cell: (p) => TIPO_LABELS[p.tipo] },
    { header: "Método", cell: (p) => METODO_LABELS[p.metodo_pago] },
    { header: "Referencia", cell: (p) => p.referencia ?? "—" },
    { header: "Fecha", cell: (p) => p.fecha_pago.slice(0, 10) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Pagos</h1>
          <p className="text-sm text-muted-foreground">Bitácora de todos los pagos registrados.</p>
        </div>
        <Button onClick={() => setPasoSeleccion(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar pago
        </Button>
      </div>

      <FilterBar>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por referencia, notas o # de reservación..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {TIPOS_PAGO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {TIPO_LABELS[tipo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Método</label>
          <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos</SelectItem>
              {METODOS_PAGO.map((metodo) => (
                <SelectItem key={metodo} value={metodo}>
                  {METODO_LABELS[metodo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {isLoading && <TableSkeleton columnas={6} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && pagosFiltrados.length === 0 && (
        <EmptyState
          titulo={busqueda ? "Sin resultados" : "Todavía no hay pagos"}
          descripcion={
            busqueda
              ? "Ningún pago coincide con tu búsqueda."
              : "Registra el primer pago de una reservación."
          }
          accion={
            !busqueda && (
              <Button onClick={() => setPasoSeleccion(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Registrar pago
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && pagosFiltrados.length > 0 && (
        <DataTable columns={columnas} data={pagosFiltrados} getRowId={(p) => p.id} />
      )}

      <SeleccionarReservacionModal
        open={pasoSeleccion}
        onOpenChange={setPasoSeleccion}
        onContinuar={(id) => {
          setPasoSeleccion(false);
          setReservacionIdActivo(id);
        }}
      />

      {reservacionIdActivo !== null && (
        <PagoModal
          open={reservacionIdActivo !== null}
          onOpenChange={(open) => !open && setReservacionIdActivo(null)}
          reservacionId={reservacionIdActivo}
          reservacionContexto={reservacionesDisponibles?.find((r) => r.id === reservacionIdActivo)}
        />
      )}
    </div>
  );
}
