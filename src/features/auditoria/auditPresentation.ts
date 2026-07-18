import type { AuditPayload } from "@/types/auditEvent";

export const ENTIDADES = [
  ["", "Todas las entidades"],
  ["reservacion", "Reservaciones"],
  ["pago", "Pagos"],
  ["caja_sesion", "Sesiones de caja"],
  ["caja_movimiento", "Movimientos de caja"],
  ["tarifa_especial", "Tarifas especiales"],
  ["usuario", "Usuarios"],
] as const;

const ACCIONES: Record<string, string> = {
  "reservacion.creada": "Reservación creada",
  "reservacion.actualizada": "Reservación actualizada",
  "reservacion.estado_actualizado": "Estado de reservación actualizado",
  "reservacion.check_in": "Check-in registrado",
  "reservacion.check_out": "Check-out registrado",
  "reservacion.solicitud_publica_creada": "Solicitud pública creada",
  "pago.registrado": "Pago registrado",
  "caja.abierta": "Caja abierta",
  "caja.movimiento_registrado": "Movimiento de caja registrado",
  "caja.cerrada": "Caja cerrada",
  "tarifa.creada": "Tarifa creada",
  "tarifa.actualizada": "Tarifa actualizada",
  "tarifa.eliminada": "Tarifa eliminada",
  "usuario.creado": "Usuario creado",
  "usuario.desactivado": "Usuario desactivado",
  "usuario.reactivado": "Usuario reactivado",
  "usuario.rol_actualizado": "Rol actualizado",
  "usuario.password_restablecido": "Credencial restablecida",
};

const CAMPOS_OCULTOS = ["password", "token", "secret", "csrf", "api_key", "clave", "authorization"];
const CAMPOS_PROTEGIDOS = ["email", "telefono", "nombre_completo", "notas", "referencia"];

function palabras(valor: string, separador: string, reemplazo: string) {
  return valor.split(separador).join(reemplazo);
}

export function etiquetaAccion(valor: string) {
  return ACCIONES[valor] ?? palabras(palabras(valor, ".", " · "), "_", " ");
}

export function etiquetaEntidad(valor: string) {
  return ENTIDADES.find(([id]) => id === valor)?.[1] ?? palabras(valor, "_", " ");
}

export function fechaLegible(valor: string) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? valor
    : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
}

export function campoOculto(clave: string) {
  const normalizada = clave.toLowerCase();
  return CAMPOS_OCULTOS.some((fragmento) => normalizada.includes(fragmento));
}

function sanitizarValor(clave: string, valor: unknown, profundidad = 0): unknown {
  const normalizada = clave.toLowerCase();
  if (campoOculto(clave)) return "[REDACTADO]";
  if (CAMPOS_PROTEGIDOS.includes(normalizada) && valor != null && valor !== "") return "[PROTEGIDO]";
  if (profundidad >= 8) return "[CONTENIDO PROFUNDO OMITIDO]";
  if (Array.isArray(valor)) return valor.map((item) => sanitizarValor("item", item, profundidad + 1));
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([hija, contenido]) => [
        hija,
        sanitizarValor(hija, contenido, profundidad + 1),
      ])
    );
  }
  return valor;
}

export function textoSeguro(clave: string, valor: unknown): string {
  const seguro = sanitizarValor(clave, valor);
  if (seguro === null || seguro === undefined || seguro === "") return "—";
  if (typeof seguro === "boolean") return seguro ? "Sí" : "No";
  if (typeof seguro === "object") return JSON.stringify(seguro, null, 2);
  return String(seguro);
}

export function diferencias(antes: AuditPayload | null, despues: AuditPayload | null) {
  const claves = new Set([...Object.keys(antes ?? {}), ...Object.keys(despues ?? {})]);
  return [...claves]
    .filter((clave) => !campoOculto(clave))
    .filter((clave) => JSON.stringify(antes?.[clave]) !== JSON.stringify(despues?.[clave]))
    .sort()
    .map((clave) => ({ clave, antes: antes?.[clave], despues: despues?.[clave] }));
}
