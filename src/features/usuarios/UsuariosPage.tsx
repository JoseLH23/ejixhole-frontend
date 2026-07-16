import * as React from "react";
import { KeyRound, Pencil, Plus, UserCheck, UserCog, UserX } from "lucide-react";

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
import { useAuth } from "@/context/AuthContext";
import {
  useDesactivarUsuario,
  useReactivarUsuario,
  useUsuarios,
} from "./useUsuarios";
import { UsuarioFormModal } from "./UsuarioFormModal";
import { EditarRolModal } from "./EditarRolModal";
import { RestablecerPasswordModal } from "./RestablecerPasswordModal";
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
 * Administración completa de cuentas: listar, crear, editar rol,
 * desactivar, reactivar y restablecer contraseña.
 */
export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch, isFetching } = useUsuarios({ limit: 100 });
  const desactivar = useDesactivarUsuario();
  const reactivar = useReactivarUsuario();
  const { usuario: usuarioActual } = useAuth();
  const { toast } = useToast();
  const mostrarError = useErrorToast();

  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [usuarioDesactivar, setUsuarioDesactivar] = React.useState<Usuario | null>(null);
  const [usuarioReactivar, setUsuarioReactivar] = React.useState<Usuario | null>(null);
  const [usuarioEditarRol, setUsuarioEditarRol] = React.useState<Usuario | null>(null);
  const [usuarioPassword, setUsuarioPassword] = React.useState<Usuario | null>(null);

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

  const confirmarReactivar = () => {
    if (!usuarioReactivar) return;
    reactivar.mutate(usuarioReactivar.id, {
      onSuccess: () => {
        toast({
          title: "Usuario reactivado",
          description: `${usuarioReactivar.nombre} ya puede iniciar sesión nuevamente.`,
          variant: "success",
        });
        setUsuarioReactivar(null);
      },
      onError: (error) => {
        mostrarError(error, "No se pudo reactivar");
        setUsuarioReactivar(null);
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
        descripcion="Administra accesos, roles, contraseñas y cuentas desactivadas."
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
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={u.email === usuarioActual?.email}
                title={
                  u.email === usuarioActual?.email
                    ? "No puedes cambiar tu propio rol — inicia sesión con otra cuenta admin"
                    : undefined
                }
                onClick={() => setUsuarioEditarRol(u)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Editar rol
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setUsuarioPassword(u)}>
                <KeyRound className="mr-1 h-4 w-4" />
                Contraseña
              </Button>

              {u.activo ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setUsuarioDesactivar(u)}
                >
                  <UserX className="mr-1 h-4 w-4" />
                  Desactivar
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUsuarioReactivar(u)}
                >
                  <UserCheck className="mr-1 h-4 w-4" />
                  Reactivar
                </Button>
              )}
            </div>
          )}
        />
      )}

      <UsuarioFormModal open={modalAbierto} onOpenChange={setModalAbierto} />

      <EditarRolModal
        usuario={usuarioEditarRol}
        onOpenChange={(open) => !open && setUsuarioEditarRol(null)}
      />

      <RestablecerPasswordModal
        usuario={usuarioPassword}
        onOpenChange={(open) => !open && setUsuarioPassword(null)}
      />

      <ConfirmDialog
        open={usuarioDesactivar !== null}
        onOpenChange={(open) => !open && setUsuarioDesactivar(null)}
        titulo="¿Desactivar este usuario?"
        descripcion={
          usuarioDesactivar
            ? `${usuarioDesactivar.nombre} no podrá iniciar sesión hasta que un administrador reactive la cuenta.`
            : ""
        }
        textoConfirmar="Desactivar"
        variante="destructive"
        cargando={desactivar.isPending}
        onConfirmar={confirmarDesactivar}
      />

      <ConfirmDialog
        open={usuarioReactivar !== null}
        onOpenChange={(open) => !open && setUsuarioReactivar(null)}
        titulo="¿Reactivar este usuario?"
        descripcion={
          usuarioReactivar
            ? `${usuarioReactivar.nombre} recuperará el acceso con su contraseña actual.`
            : ""
        }
        textoConfirmar="Reactivar"
        cargando={reactivar.isPending}
        onConfirmar={confirmarReactivar}
      />
    </div>
  );
}
