/**
 * Colores para gráficas de Recharts. Recharts pinta con SVG
 * (`stroke`/`fill` como atributos), que no siempre resuelve
 * `hsl(var(--primary))` de forma confiable entre navegadores — por
 * eso, a diferencia del resto del sistema (que usa clases de Tailwind
 * sobre variables CSS), las gráficas necesitan strings de color
 * literales.
 *
 * En vez de repetir esos literales en cada página de reporte (como
 * pasaba antes de la Entrega 5), viven en un solo lugar. Si cambia la
 * paleta en `index.css`, estos valores hay que actualizarlos a mano
 * aquí también — es la única excepción documentada a "cero colores
 * hardcodeados" en todo el proyecto, y existe por una limitación real
 * de la librería de gráficas, no por descuido.
 */
export const CHART_COLORS = {
  primary: "#2F7A54", // verde selva
  secondary: "#12798A", // turquesa agua
  wood: "#A9743F", // madera
  success: "#34936B",
  warning: "#E0A030",
  destructive: "#C1443A",
} as const;

/** Mismo mapeo de estado → color que usa <EstadoBadge/>, para que las gráficas nunca se vean distintas de los badges. */
export const CHART_COLOR_POR_ESTADO: Record<string, string> = {
  pendiente: CHART_COLORS.warning,
  confirmada: CHART_COLORS.secondary,
  completada: CHART_COLORS.primary,
  cancelada: CHART_COLORS.destructive,
};
