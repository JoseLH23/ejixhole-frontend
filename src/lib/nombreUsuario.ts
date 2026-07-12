/**
 * Nombre visible del usuario en el saludo del Dashboard y el menú de
 * cuenta del Sidebar.
 *
 * ACTUALIZACIÓN (Fase 1, GET /auth/me implementado): el backend ya
 * expone el nombre real (`app/routes/auth_routes.py` — GET /auth/me,
 * reutiliza `get_current_user`). `AuthContext.tsx` lo trae de forma
 * asíncrona apenas hay sesión y lo guarda en `usuario.nombre`.
 *
 * Esta función ahora es solo el **respaldo**, usado únicamente cuando
 * `usuario.nombre` todavía no llegó (ej. el instante entre restaurar
 * la sesión y que resuelva la llamada a /auth/me) o si esa llamada
 * falla por red. Ya no es la única fuente de verdad — se deja el mapa
 * de `chepo23larios` como fallback explícito para ese caso puntual,
 * documentado igual que antes.
 */
const NOMBRES_TEMPORALES: Record<string, string> = {
  chepo23larios: "José Larios",
};

export function nombreVisible(email: string): string {
  const usuarioEmail = email.split("@")[0]?.toLowerCase() ?? "";
  const nombreConocido = NOMBRES_TEMPORALES[usuarioEmail];
  if (nombreConocido) return nombreConocido;

  // Fallback genérico para cualquier otro usuario: al menos capitaliza
  // el nombre de usuario del correo en vez de mostrarlo tal cual.
  return usuarioEmail
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
