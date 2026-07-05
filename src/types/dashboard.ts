/**
 * Tipos que reflejan app/schemas/dashboard.py del backend.
 *
 * Nota importante sobre `valor` / `comparacion_valor_anterior`: el
 * backend serializa los campos `Decimal` (dinero) como STRING
 * (ej. "300.00") y los campos `int`/`float` (conteos, porcentajes)
 * como número JSON — el mismo comportamiento ya documentado en
 * docs/modulos/reportes-entrega-1.md del backend. Por eso el tipo es
 * `string | number`, y KpiCard decide cómo formatear cada uno (ver
 * KpiCard.tsx).
 */

export type Tendencia = "up" | "down" | "neutral";

export interface Tarjeta {
  titulo: string;
  valor: string | number;
  comparacion_valor_anterior: string | number | null;
  comparacion_porcentaje: number | null;
  tendencia: Tendencia | null;
}

export interface DashboardResumen {
  fecha: string; // ISO date, ej. "2026-07-05"
  tarjetas: Tarjeta[];
}
