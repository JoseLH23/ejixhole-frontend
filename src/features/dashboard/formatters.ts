/**
 * El backend (DashboardResumenOut) no manda un campo "tipo"/"unidad"
 * por tarjeta — solo `valor` como string (dinero, Decimal serializado)
 * o number (conteos/porcentajes). Para decidir cómo formatear cada
 * tarjeta:
 *
 * 1. Si `valor` llega como STRING → siempre es dinero (así serializa
 *    Pydantic los campos Decimal en todo el proyecto).
 * 2. Si `valor` llega como NUMBER → es un conteo, salvo que el título
 *    esté en TITULOS_PORCENTAJE (las 2 tarjetas que son tasas/promedios).
 *
 * Esto está acoplado a los títulos exactos que genera
 * DashboardService.resumen() en el backend. Si el backend renombra una
 * tarjeta, hay que actualizar esta lista — ver
 * docs/modulos/dashboard-entrega-1.md para los 9 títulos oficiales.
 */
import { formatearMoneda } from "@/lib/format";

const TITULOS_PORCENTAJE = new Set(["Tasa de cancelación (mes)", "Ocupación promedio (mes)"]);

export type FormatoValor = "moneda" | "porcentaje" | "conteo";

export function inferirFormato(titulo: string, valor: string | number): FormatoValor {
  if (typeof valor === "string") return "moneda";
  if (TITULOS_PORCENTAJE.has(titulo)) return "porcentaje";
  return "conteo";
}

const formateadorConteo = new Intl.NumberFormat("es-MX");

export function formatearValor(valor: string | number, formato: FormatoValor): string {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;

  if (Number.isNaN(numero)) return String(valor);

  switch (formato) {
    case "moneda":
      return formatearMoneda(valor);
    case "porcentaje":
      return `${numero.toFixed(1)}%`;
    case "conteo":
      return formateadorConteo.format(numero);
  }
}
