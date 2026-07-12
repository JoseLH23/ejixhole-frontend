import { UserCog } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge, EstadoBadge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useUsuarios } from "./useUsuarios";
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
 * Módulo Usuarios — listado real vía GET /usuarios (Fase 1, reutiliza
 * UsuarioOut/get_current_user ya existentes en el backend).
 *
 * Alcance real de esta entrega: SOLO listar. El backend todavía no
 * expone editar/desactivar/cambiar rol/reset de contraseña para
 * usuarios existentes — por instrucción explícita ("no inventes
 * endpoints"), esta pantalla no ofrece esas acciones todavía. Crear
 * usuario sí existe en el backend (POST /auth/usuarios), pero conectar
 * ese formulario aquí necesita primero un GET /roles para poblar el
 * selector de rol de forma real (hoy no existe) — se deja para la
 * siguiente entrega de este módulo, no se improvisa una lista de roles
 * hardcodeada que podría desincronizarse de la tabla `roles` real.
 */
export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch, isFetching } = useUsuarios({ limit: 100 });

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
      />

      {isLoading && <TableSkeleton columnas={4} />}

      {isError && !isLoading && (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && !isError && (usuarios?.length ?? 0) === 0 && (
        <EmptyState titulo="No hay usuarios registrados" icon={UserCog} />
      )}

      {!isLoading && !isError && usuarios && usuarios.length > 0 && (
        <DataTable columns={columnas} data={usuarios} getRowId={(u) => u.id} />
      )}
    </div>
  );
}
