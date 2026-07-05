/**
 * Interpretación centralizada de errores de la API. Antes, 12 archivos
 * distintos repetían `error?.response?.data?.detail` a mano con
 * mensajes de fallback inconsistentes — esto reemplaza todo eso con
 * una sola fuente de verdad, y además da mensajes amigables por
 * código de estado (401/403/404/409/422/500/sin conexión), no solo el
 * `detail` crudo del backend.
 */

export interface ErrorInfo {
  title: string;
  description: string;
}

function extraerDetail(error: unknown): string | undefined {
  const detail = (error as any)?.response?.data?.detail;
  return typeof detail === "string" ? detail : undefined;
}

export function getErrorInfo(error: unknown, tituloPorDefecto = "Algo salió mal"): ErrorInfo {
  const status = (error as any)?.response?.status as number | undefined;
  const detail = extraerDetail(error);

  switch (status) {
    case 401:
      return {
        title: "Sesión expirada",
        description: "Vuelve a iniciar sesión para continuar.",
      };
    case 403:
      return {
        title: "Sin permiso",
        description: detail ?? "Tu rol no tiene acceso a esta acción.",
      };
    case 404:
      return {
        title: "No encontrado",
        description: detail ?? "El recurso solicitado ya no existe.",
      };
    case 409:
      return {
        title: "Conflicto",
        description: detail ?? "Esta acción entra en conflicto con el estado actual de los datos.",
      };
    case 422:
      return {
        title: "Datos inválidos",
        description: detail ?? "Revisa los datos ingresados e intenta de nuevo.",
      };
    case 500:
    case 502:
    case 503:
      return {
        title: "Error del servidor",
        description: "Ocurrió un problema en el servidor. Intenta de nuevo en unos momentos.",
      };
    default:
      if (status === undefined) {
        return {
          title: "Sin conexión",
          description: "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
        };
      }
      return { title: tituloPorDefecto, description: detail ?? "Intenta de nuevo." };
  }
}
