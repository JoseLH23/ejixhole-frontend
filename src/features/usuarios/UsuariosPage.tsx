import * as React from "react";
import { Plus, UserX, UserCog } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge, EstadoBadge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useUsuarios, useDesactivarUsuario } from "./useUsuarios";
import { UsuarioFormModal } from "./UsuarioFormModal";
import type { Usuario } from "@/types/usuario";

const ROL_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  operador: "secondary",
  cajero: "outline",
};

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  cajero: "Cajero",
};

function RolBadge({ rol }: { rol: string }) {
  return <Badge variant={ROL_VARIANT[rol] ?? "outline"}>{ROL_LABEL[rol] ?? rol}</Badge>;
}

/**
 * Módulo Usuarios — listar (GET /usuarios), crear (POST /auth/usuarios,
 * ya existía) y desactivar (DELETE /usuarios/{id}, protegido contra
 * dejar el sistema sin ningún admin activo). Reutiliza get_current_user,
 * UsuarioOut y el patrón de ConfirmDialog ya usado en Clientes/Servicios.
 *
 * Todavía no incluye: editar nombre/email/rol de un usuario existente,
 * ni reset de contraseña — el backend no los expone aún.
 */
export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch, isFetching } = useUsuarios({ limit: 100 });
  const desactivar = useDesactivarUsuario();
  const { toast } = useToast();
  const mostrarError = useErrorToast();

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [usuarioDesactivar, setUsuarioDesactivar] = React.useState<Usuario | null>(null);

  const confirmarDesactivar = () => {
    if (!usuarioDesactivar) return;
    desactivar.mutate(usuarioDesactivar.id, {
      onSuccess: () => {
        toast({ title: "Usuario desactivado", variant: "success" });
        setUsuarioDesactivar(null);
      },
      onError: (error) => {
        mostrarError(error, "No se pudo desactivar");
        setUsuarioDesactivar(null);
      },
    });
  };

  const columnas: DataTableColumn<Usuario>[] = [
    { header: "Nombre", cell: (u) => <span className="font-medium">{u.nombre}</span> },
    { header: "Email", cell: (u) => u.email },
    { header: "Rol", cell: (u) => <RolBadge rol={u.rol} /> },
    { header: "Estado", cell: (u) => <EstadoBadge estado={u.activo ? "activo" : "inactivo"} /> },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas del sistema y sus roles."
        icon={UserCog}
        acento="wood"
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      {isLoading && <TableSkeleton columnas={4} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && (usuarios?.length ?? 0) === 0 && (
        <EmptyState titulo="No hay usuarios registrados" icon={UserCog} />
      )}

      {!isLoading && !isError && usuarios && usuarios.length > 0 && (
        <DataTable
          columns={columnas}
          data={usuarios}
          getRowId={(u) => u.id}
          renderAcciones={(u) => (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={!u.activo}
              onClick={() => setUsuarioDesactivar(u)}
            >
              <UserX className="mr-1 h-4 w-4" />
              Desactivar
            </Button>
          )}
        />
      )}

      <UsuarioFormModal open={modalAbierto} onOpenChange={setModalAbierto} />

      <ConfirmDialog
        open={usuarioDesactivar !== null}
        onOpenChange={(open) => !open && setUsuarioDesactivar(null)}
        titulo="¿Desactivar este usuario?"
        descripcion={
          usuarioDesactivar
            ? `${usuarioDesactivar.nombre} ya no podrá iniciar sesión. Esto no se puede deshacer desde aquí.`
            : ""
        }
        textoConfirmar="Desactivar"
        variante="destructive"
        cargando={desactivar.isPending}
        onConfirmar={confirmarDesactivar}
      />
    </div>
  );
}
