import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Tendencia } from "@/types/dashboard";

const CONFIG: Record<Tendencia, { Icon: typeof ArrowUpRight; color: string; barColor: string }> = {
  up: { Icon: ArrowUpRight, color: "text-success", barColor: "bg-success" },
  down: { Icon: ArrowDownRight, color: "text-destructive", barColor: "bg-destructive" },
  neutral: { Icon: Minus, color: "text-muted-foreground", barColor: "bg-muted-foreground" },
};

/**
 * Barra de tendencia — representa el único número real que da el
 * backend (`comparacion_porcentaje`, un punto contra el periodo
 * anterior), NO una serie histórica falsa. Deliberadamente es una
 * sola barra de magnitud, no un sparkline de varios puntos, para no
 * insinuar datos que no existen.
 */
export function TrendBar({
  tendencia,
  porcentaje,
}: {
  tendencia: Tendencia | null;
  porcentaje: number | null;
}) {
  if (!tendencia || porcentaje === null) return null;

  const { Icon, color, barColor } = CONFIG[tendencia];
  const magnitud = Math.min(Math.abs(porcentaje), 100);

  return (
    <div className="mt-3 space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${magnitud}%` }}
        />
      </div>
      <p className={cn("flex items-center gap-1 text-xs font-medium", color)}>
        <Icon className="h-3.5 w-3.5" />
        {Math.abs(porcentaje).toFixed(1)}% vs. periodo anterior
      </p>
    </div>
  );
}
