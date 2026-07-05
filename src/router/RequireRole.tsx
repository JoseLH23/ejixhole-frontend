import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import type { Rol } from "@/types/auth";

/**
 * Envuelve rutas que además de sesión requieren un rol específico.
 * Esto es UX (evitar que alguien llegue a una pantalla que de todos
 * modos el backend le va a rechazar) — la autorización REAL ya la
 * garantiza el backend con 401/403 en cada request, esto no la
 * reemplaza. Ver docs/modulos/permisos-por-rol.md.
 */
export function RequireRole({ roles }: { roles: Rol[] }) {
  const { tieneRol } = useAuth();

  if (!tieneRol(roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}
