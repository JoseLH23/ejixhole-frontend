import * as React from "react";
import { Plus, Pencil, Ban, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useDebounce } from "@/hooks/useDebounce";
import { formatearMoneda } from "@/lib/format";
import { useServicios, useDesactivarServicio } from "./useServicios";
import { ServicioFormModal } from "./ServicioFormModal";
import type { Servicio } from "@/types/servicio";

/**
 * Búsqueda del lado del navegador — igual decisión que en Clientes
 * (GET /servicios no soporta texto libre, solo `categoria` exacta).
 * Ver docs/entrega-3a.md para el razonamiento completo; aplica igual
 * aquí, sin duplicar la explicación.
 */
function coincideBusqueda(servicio: Servicio, busqueda: string): boolean {
  const texto = busqueda.trim().toLowerCase();
  if (!texto) return true;
  return [servicio.nombre, servicio.categoria, servicio.descripcion]
    .filter(Boolean)
    .some((campo) => campo!.toLowerCase().includes(texto));
}

export function ServiciosListPage() {
  const { data: servicios, isLoading, isError, error, refetch, isFetching } = useServicios();
  const desactivar = useDesactivarServicio();
  const { toast } = useToast();

  const [busqueda, setBusqueda] = React.useState("");
  const busquedaDebounced = useDebounce(busqueda);

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [servicioEditar, setServicioEditar] = React.useState<Servicio | null>(null);
  const [servicioDesactivar, setServicioDesactivar] = React.useState<Servicio | null>(null);

  const serviciosFiltrados = React.useMemo(
    () => (servicios ?? []).filter((s) => coincideBusqueda(s, busquedaDebounced)),
    [servicios, busquedaDebounced]
  );

  const abrirCrear = () => {
    setServicioEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (servicio: Servicio) => {
    setServicioEditar(servicio);
    setModalAbierto(true);
  };

  const confirmarDesactivar = () => {
    if (!servicioDesactivar) return;
    desactivar.mutate(servicioDesactivar.id, {
      onSuccess: () => {
        toast({ title: "Servicio desactivado", variant: "success" });
        setServicioDesactivar(null);
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        toast({
          title: "No se pudo desactivar",
          description: typeof detail === "string" ? detail : "Intenta de nuevo.",
          variant: "error",
        });
        setServicioDesactivar(null);
      },
    });
  };

  const columnas: DataTableColumn<Servicio>[] = [
    {
      header: "Nombre",
      cell: (s) => (
        <div>
          <p className="font-medium">{s.nombre}</p>
          {s.descripcion && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{s.descripcion}</p>
          )}
        </div>
      ),
    },
    {
      header: "Categoría",
      cell: (s) => (s.categoria ? <Badge variant="outline">{s.categoria}</Badge> : "—"),
    },
    {
      header: "Precio",
      cell: (s) => <span className="font-mono">{formatearMoneda(s.precio)}</span>,
    },
    {
      header: "Duración",
      cell: (s) => (s.duracion_minutos ? `${s.duracion_minutos} min` : "—"),
    },
    {
      header: "Capacidad",
      cell: (s) => (s.capacidad_maxima ? `${s.capacidad_maxima} personas` : "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Servicios</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de experiencias disponibles para reservar.
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo servicio
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, categoría o descripción..."
          className="pl-9"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {isLoading && <TableSkeleton columnas={5} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && serviciosFiltrados.length === 0 && (
        <EmptyState
          titulo={busqueda ? "Sin resultados" : "Todavía no hay servicios"}
          descripcion={
            busqueda
              ? "Ningún servicio coincide con tu búsqueda."
              : "Crea el primer servicio para poder generar reservaciones."
          }
          accion={
            !busqueda && (
              <Button onClick={abrirCrear} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo servicio
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && serviciosFiltrados.length > 0 && (
        <DataTable
          columns={columnas}
          data={serviciosFiltrados}
          getRowId={(s) => s.id}
          renderAcciones={(s) => (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => abrirEditar(s)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setServicioDesactivar(s)}
                aria-label="Desactivar"
              >
                <Ban className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        />
      )}

      <ServicioFormModal open={modalAbierto} onOpenChange={setModalAbierto} servicioEditar={servicioEditar} />

      <ConfirmDialog
        open={servicioDesactivar !== null}
        onOpenChange={(open) => !open && setServicioDesactivar(null)}
        titulo="¿Desactivar este servicio?"
        descripcion={`${servicioDesactivar?.nombre ?? ""} ya no aparecerá disponible para nuevas reservaciones. No se puede desactivar si tiene una reservación activa.`}
        textoConfirmar="Desactivar"
        variante="destructive"
        cargando={desactivar.isPending}
        onConfirmar={confirmarDesactivar}
      />
    </div>
  );
}
