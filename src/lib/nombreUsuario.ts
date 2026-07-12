/**
 * Nombre visible del usuario en el saludo del Dashboard y el menú de
 * cuenta del Sidebar.
 *
 * BLOQUEADO POR BACKEND: el JWT que devuelve POST /auth/login solo
 * lleva `sub` (email) y `rol` (ver app/core/security.py:
 * create_access_token — payload = {"sub": subject, "rol": rol, "exp":
 * expire}). El modelo Usuario del backend SÍ tiene un campo `nombre`
 * (app/models/usuario.py), pero nunca se expone al frontend: no existe
 * GET /auth/me, y el JWT no lo incluye. Es decir, hoy es
 * estructuralmente imposible mostrar el nombre real sin un cambio de
 * backend — que esta entrega tiene prohibido tocar.
 *
 * Para desbloquear esto de verdad, la opción más simple es una de:
 *   a) agregar "nombre": usuario.nombre al payload en create_access_token, o
 *   b) exponer GET /auth/me -> UsuarioOut (el schema YA existe y ya
 *      incluye `nombre`, solo falta la ruta).
 *
 * Mientras tanto, este archivo es el ÚNICO lugar del proyecto con un
 * nombre hardcodeado — explícito, aislado, y fácil de borrar en cuanto
 * el backend exponga el dato real. Se aplica solo por coincidencia de
 * email (no por texto libre), así que nunca le pone "José Larios" a
 * otro usuario del sistema.
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
