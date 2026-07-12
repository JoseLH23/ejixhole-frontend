import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tarjeta } from "@/types/dashboard";
import { formatearValor, inferirFormato } from "./formatters";
import { MiniTrendLine } from "./MiniTrendLine";

function aNumero(valor: string | number | null): number | null {
  if (valor === null) return null;
  const n = typeof valor === "string" ? parseFloat(valor) : valor;
  return Number.isNaN(n) ? null : n;
}

/**
 * Tarjeta de KPI uniforme — las 4 de la fila principal del Dashboard,
 * replicando el layout de la imagen de referencia: círculo de ícono,
 * etiqueta en mayúsculas, valor grande, flecha+% de tendencia y una
 * mini-línea con los 2 puntos reales (ver MiniTrendLine.tsx).
 */
export function KpiRowCard({
  tarjeta,
  icon: Icon,
  tinte,
}: {
  tarjeta: Tarjeta;
  icon: LucideIcon;
  tinte: string;
}) {
  const formato = inferirFormato(tarjeta.titulo, tarjeta.valor);
  const anterior = aNumero(tarjeta.comparacion_valor_anterior);
  const actual = aNumero(tarjeta.valor);
  const tieneTrend = tarjeta.tendencia && tarjeta.tendencia !== "neutral" && anterior !== null && actual !== null;
  const Flecha = tarjeta.tendencia === "down" ? ArrowDownRight : ArrowUpRight;
  const colorTendencia = tarjeta.tendencia === "down" ? "destructive" : "success";

  return (
    <Card className="transition-shadow duration-200 hover:shadow-premium-hover">
      <CardContent className="p-3.5">
        <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-full", tinte)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tarjeta.titulo}
        </p>
        <p className="mt-0.5 font-display text-xl font-semibold tabular-nums">
          {formatearValor(tarjeta.valor, formato)}
        </p>

        {tieneTrend && (
          <div className="mt-1.5 flex items-end justify-between">
            <span
              className={cn(
                "flex items-center gap-0.5 text-[11px] font-medium",
                colorTendencia === "success" ? "text-success" : "text-destructive"
              )}
            >
              <Flecha className="h-3 w-3" />
              {Math.abs(tarjeta.comparacion_porcentaje ?? 0).toFixed(0)}% vs. anterior
            </span>
            <MiniTrendLine anterior={anterior!} actual={actual!} color={colorTendencia} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
