/**
 * Formateador de moneda compartido. Antes vivía solo dentro de
 * features/dashboard/formatters.ts — se extrajo aquí porque Servicios
 * (y cualquier módulo futuro con precios) lo necesita también. Nunca
 * se duplica esta lógica en un módulo nuevo.
 */
const formateadorMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function formatearMoneda(valor: string | number): string {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (Number.isNaN(numero)) return String(valor);

  const formateado = formateadorMoneda.format(Math.abs(numero));
  return numero < 0 ? `-${formateado}` : formateado;
}
