import * as React from "react";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatearMoneda } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useCajaSesionActual, useCajaSesiones, useCajaMovimientos } from "./useCaja";
import { AbrirCajaModal } from "./AbrirCajaModal";
import { CerrarCajaModal } from "./CerrarCajaModal";
import { RegistrarMovimientoModal } from "./RegistrarMovimientoModal";
import { ESTADOS_CAJA, type CajaSesion, type EstadoCaja } from "@/types/caja";

const FILTRO_TODOS = "todos";

export function CajaPage() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;

  const [modalAbrir, setModalAbrir] = React.useState(false);
  const [modalCerrar, setModalCerrar] = React.useState(false);
  const [modalMovimiento, setModalMovimiento] = React.useState(false);
  const [filtroEstado, setFiltroEstado] = React.useState<string>(FILTRO_TODOS);

  const {
    sesionActual,
    isLoading: cargandoActual,
    isError: errorActual,
    error: errorActualDetalle,
    refetch: refetchActual,
  } = useCajaSesionActual(usuarioId);

  const movimientos = useCajaMovimientos(sesionActual?.id ?? null);
  const historial = useCajaSesiones({
    estado: filtroEstado === FILTRO_TODOS ? undefined : (filtroEstado as EstadoCaja),
  });

  const columnasMovimientos: DataTableColumn<{
    id: number;
    tipo: string;
    monto: string;
    concepto: string;
    fecha: string;
  }>[] = [
    {
      header: "Tipo",
      cell: (m) => (
        <span className="flex items-center gap-1">
          {m.tipo === "ingreso" ? (
            <ArrowUpCircle className="h-4 w-4 text-success" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          )}
          {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
        </span>
      ),
    },
    { header: "Monto", cell: (m) => <span className="font-mono">{formatearMoneda(m.monto)}</span> },
    { header: "Concepto", cell: (m) => m.concepto },
    { header: "Fecha", cell: (m) => m.fecha.slice(0, 16).replace("T", " ") },
  ];

  const columnasHistorial: DataTableColumn<CajaSesion>[] = [
    { header: "ID", cell: (s) => `#${s.id}` },
    { header: "Usuario", cell: (s) => (s.usuario_id === usuarioId ? "Tú" : `#${s.usuario_id}`) },
    { header: "Apertura", cell: (s) => s.fecha_apertura.slice(0, 16).replace("T", " ") },
    { header: "Cierre", cell: (s) => (s.fecha_cierre ? s.fecha_cierre.slice(0, 16).replace("T", " ") : "—") },
    { header: "Estado", cell: (s) => <EstadoBadge estado={s.estado} /> },
    {
      header: "Diferencia",
      cell: (s) =>
        s.diferencia === null ? (
          "—"
        ) : (
          <span
            className={
              Number(s.diferencia) < 0
                ? "text-destructive"
                : Number(s.diferencia) > 0
                  ? "text-success"
                  : ""
            }
          >
            {formatearMoneda(s.diferencia)}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Caja"
        descripcion="Apertura, cobros en efectivo, movimientos y cierre de caja."
        icon={Landmark}
        acento="primary"
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Mi caja</h2>

        {!usuarioId && (
          <Card className="border-dashed">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Cargando tu perfil para identificar la caja de tu sesión…
            </CardContent>
          </Card>
        )}

        {usuarioId && cargandoActual && <TableSkeleton filas={1} columnas={4} />}

        {usuarioId && errorActual && !cargandoActual && (
          <ErrorState error={errorActualDetalle} onRetry={() => refetchActual()} />
        )}

        {usuarioId && !cargandoActual && !errorActual && !sesionActual && (
          <EmptyState
            titulo="No tienes una caja abierta"
            icon={Wallet}
            descripcion="Abre una caja antes de recibir pagos en efectivo."
            accion={
              <Button onClick={() => setModalAbrir(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Abrir caja
              </Button>
            }
          />
        )}

        {usuarioId && !cargandoActual && !errorActual && sesionActual && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Sesión #{sesionActual.id}</CardTitle>
                <CardDescription>
                  Abierta el {sesionActual.fecha_apertura.slice(0, 16).replace("T", " ")}
                </CardDescription>
              </div>
              <EstadoBadge estado="abierta" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Apertura</p>
                  <p className="font-mono text-lg">{formatearMoneda(sesionActual.monto_apertura)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo actual</p>
                  <p className="font-mono text-lg font-semibold">{formatearMoneda(sesionActual.saldo_actual)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setModalMovimiento(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Registrar movimiento
                </Button>
                <Button size="sm" variant="outline" onClick={() => setModalCerrar(true)}>
                  Cerrar caja
                </Button>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Movimientos de esta sesión</p>
                {movimientos.isLoading && <TableSkeleton filas={2} columnas={4} />}
                {movimientos.isError && (
                  <ErrorState error={movimientos.error} titulo="No se pudieron cargar los movimientos" />
                )}
                {!movimientos.isLoading && !movimientos.isError && (movimientos.data?.length ?? 0) === 0 && (
                  <EmptyState titulo="Sin movimientos todavía" />
                )}
                {!movimientos.isLoading && !movimientos.isError && (movimientos.data?.length ?? 0) > 0 && (
                  <DataTable columns={columnasMovimientos} data={movimientos.data!} getRowId={(m) => m.id} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historial de cajas</h2>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODOS}>Todos los estados</SelectItem>
              {ESTADOS_CAJA.map((estado) => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {historial.isLoading && <TableSkeleton columnas={6} />}
        {historial.isError && !historial.isLoading && (
          <ErrorState error={historial.error} onRetry={() => historial.refetch()} retrying={historial.isFetching} />
        )}
        {!historial.isLoading && !historial.isError && (historial.data?.length ?? 0) === 0 && (
          <EmptyState titulo="Sin sesiones de caja todavía" />
        )}
        {!historial.isLoading && !historial.isError && (historial.data?.length ?? 0) > 0 && (
          <DataTable columns={columnasHistorial} data={historial.data!} getRowId={(s) => s.id} />
        )}
      </div>

      <AbrirCajaModal open={modalAbrir} onOpenChange={setModalAbrir} />

      {sesionActual && (
        <>
          <RegistrarMovimientoModal open={modalMovimiento} onOpenChange={setModalMovimiento} sesionId={sesionActual.id} />
          <CerrarCajaModal open={modalCerrar} onOpenChange={setModalCerrar} sesion={sesionActual} />
        </>
      )}
    </div>
  );
}
