/**
 * AL-04 (auditoría de seguridad 13/jul/2026): genera una clave real
 * de idempotencia para proteger contra doble clic/doble envío en
 * operaciones críticas (crear reservación, registrar pago).
 *
 * crypto.randomUUID() es nativo del navegador — no se agrega ninguna
 * librería nueva solo para esto.
 */
export function generarIdempotencyKey(): string {
  return crypto.randomUUID();
}
