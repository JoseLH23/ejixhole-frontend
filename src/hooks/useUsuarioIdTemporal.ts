import * as React from "react";

const STORAGE_KEY = "ejixhole_usuario_id_temporal";

/**
 * Limitación real del backend (documentada en app/schemas/reservacion.py
 * y app/schemas/pago.py): el JWT solo trae `sub` (email) y `rol`, no el
 * `usuario_id` numérico, y no existe ningún endpoint (`/auth/me` o un
 * listado de usuarios) para resolverlo a partir de la sesión.
 *
 * Mientras eso no se resuelva en el backend, se le pide al usuario su
 * propio `usuario_id` UNA VEZ por navegador y se cachea en
 * localStorage — se reutiliza en Reservaciones, y se reutilizará en
 * Pagos/Caja cuando se implementen (mismo campo `usuario_id`
 * temporal en los tres módulos).
 */
export function useUsuarioIdTemporal() {
  const [usuarioId, setUsuarioIdState] = React.useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );

  const setUsuarioId = React.useCallback((valor: string) => {
    localStorage.setItem(STORAGE_KEY, valor);
    setUsuarioIdState(valor);
  }, []);

  return { usuarioId, setUsuarioId };
}
