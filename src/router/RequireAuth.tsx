import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

/**
 * Envuelve todas las rutas que requieren sesión iniciada. Si no hay
 * sesión, redirige a /login conservando la ruta original en
 * `state.from` para poder regresar ahí después de iniciar sesión.
 */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // el layout raíz ya muestra un loader global mientras tanto
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
