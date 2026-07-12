import * as React from "react";
import { Plus, Pencil, UserX, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useClientes, useDesactivarCliente } from "./useClientes";
import { ClienteFormModal } from "./ClienteFormModal";
import type { Cliente } from "@/types/cliente";

/**
 * Búsqueda: el backend GET /clientes no soporta un filtro de texto
 * (solo solo_activos/limit/offset) — se filtra en el navegador sobre
 * la página ya cargada (hasta 100 clientes, el límite por defecto).
 * Si el catálogo de clientes crece más allá de eso, esto necesitará
 * paginación real + búsqueda del lado del servidor.
 */
function coincideBusqueda(cliente: Cliente, busqueda: string): boolean {
  const texto = busqueda.trim().toLowerCase();
  if (!texto) return true;
  return [cliente.nombre, cliente.apellido, cliente.telefono, cliente.email]
    .filter(Boolean)
    .some((campo) => campo!.toLowerCase().includes(texto));
}

export function ClientesListPage() {
  const { data: clientes, isLoading, isError, error, refetch, isFetching } = useClientes();
  const desactivar = useDesactivarCliente();
  const { toast } = useToast();
  const mostrarError = useErrorToast();

  const [busqueda, setBusqueda] = React.useState("");
  const busquedaDebounced = useDebounce(busqueda);

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [clienteEditar, setClienteEditar] = React.useState<Cliente | null>(null);
  const [clienteDesactivar, setClienteDesactivar] = React.useState<Cliente | null>(null);

  const clientesFiltrados = React.useMemo(
    () => (clientes ?? []).filter((c) => coincideBusqueda(c, busquedaDebounced)),
    [clientes, busquedaDebounced]
  );

  const abrirCrear = () => {
    setClienteEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setModalAbierto(true);
  };

  const confirmarDesactivar = () => {
    if (!clienteDesactivar) return;
    desactivar.mutate(clienteDesactivar.id, {
      onSuccess: () => {
        toast({ title: "Cliente desactivado", variant: "success" });
        setClienteDesactivar(null);
      },
      onError: (error) => {
        mostrarError(error, "No se pudo desactivar");
        setClienteDesactivar(null);
      },
    });
  };

  const columnas: DataTableColumn<Cliente>[] = [
    {
      header: "Nombre",
      cell: (c) => (
        <div>
          <p className="font-medium">{[c.nombre, c.apellido].filter(Boolean).join(" ")}</p>
          {c.notas && <p className="text-xs text-muted-foreground">{c.notas}</p>}
        </div>
      ),
    },
    { header: "Teléfono", cell: (c) => c.telefono ?? "—" },
    { header: "Email", cell: (c) => c.email ?? "—" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Clientes"
        descripcion="Gestiona los clientes registrados."
        icon={Users}
        acento="primary"
        fotoUrl="https://ejixhole-reservas.vercel.app/gallery/visitantes-1.jpg"
        fotoAlt="Visitantes de EjiXhole"
        acciones={
          <Button onClick={abrirCrear}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      <FilterBar>
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </FilterBar>

      {isLoading && <TableSkeleton columnas={3} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && clientesFiltrados.length === 0 && (
        <EmptyState
          titulo={busqueda ? "Sin resultados" : "Todavía no hay clientes"}
          descripcion={
            busqueda
              ? "Ningún cliente coincide con tu búsqueda."
              : "Crea el primer cliente para empezar a registrar reservaciones."
          }
          accion={
            !busqueda && (
              <Button onClick={abrirCrear} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo cliente
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && clientesFiltrados.length > 0 && (
        <DataTable
          columns={columnas}
          data={clientesFiltrados}
          getRowId={(c) => c.id}
          renderAcciones={(c) => (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => abrirEditar(c)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setClienteDesactivar(c)}
                aria-label="Desactivar"
              >
                <UserX className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        />
      )}

      <ClienteFormModal open={modalAbierto} onOpenChange={setModalAbierto} clienteEditar={clienteEditar} />

      <ConfirmDialog
        open={clienteDesactivar !== null}
        onOpenChange={(open) => !open && setClienteDesactivar(null)}
        titulo="¿Desactivar este cliente?"
        descripcion={`${clienteDesactivar?.nombre ?? ""} ya no aparecerá en el listado activo. Esta acción no borra su historial de reservaciones.`}
        textoConfirmar="Desactivar"
        variante="destructive"
        cargando={desactivar.isPending}
        onConfirmar={confirmarDesactivar}
      />
    </div>
  );
}
