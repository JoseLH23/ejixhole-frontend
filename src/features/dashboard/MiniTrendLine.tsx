import { CHART_COLORS } from "@/lib/chartColors";

/**
 * Línea de tendencia mini — usa los ÚNICOS 2 puntos reales que da el
 * backend por tarjeta: `comparacion_valor_anterior` (periodo anterior)
 * y `valor` (actual). NO es un sparkline de varios días fabricado —
 * sería insinuar una granularidad diaria que /dashboard/resumen no
 * expone. Dos puntos reales, no siete inventados.
 *
 * Usa colores literales de chartColors.ts (no hsl(var(--x))) por la
 * misma razón ya documentada ahí: los atributos SVG stroke/fill no
 * resuelven variables CSS de forma confiable entre navegadores.
 */
export function MiniTrendLine({
  anterior,
  actual,
  color,
}: {
  anterior: number;
  actual: number;
  color: "success" | "destructive" | "muted";
}) {
  const max = Math.max(anterior, actual, 1);
  const min = Math.min(anterior, actual, 0);
  const rango = max - min || 1;

  // 2 puntos reales, viewBox 64x24, con margen vertical.
  const y1 = 20 - ((anterior - min) / rango) * 16;
  const y2 = 20 - ((actual - min) / rango) * 16;

  const strokeColor =
    color === "success" ? CHART_COLORS.success : color === "destructive" ? CHART_COLORS.destructive : "#9CA3AF";

  return (
    <svg viewBox="0 0 64 24" className="h-6 w-16" aria-hidden="true">
      <polyline points={`2,${y1} 62,${y2}`} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="62" cy={y2} r="2.5" fill={strokeColor} />
    </svg>
  );
}
