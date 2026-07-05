import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
 * "Resumen mensual" — usa la tarjeta real "Ingresos del mes" de
 * /dashboard/resumen, la misma que consumen las demás vistas. No
 * requiere Reportes (admin-only), así que se muestra a los 3 roles.
 */
export function ResumenMensualCard({ tarjeta }: { tarjeta: Tarjeta | undefined }) {
  if (!tarjeta) return null;

  const anterior = aNumero(tarjeta.comparacion_valor_anterior);
  const actual = aNumero(tarjeta.valor);
  const tieneTrend = tarjeta.tendencia && tarjeta.tendencia !== "neutral" && anterior !== null && actual !== null;
  const Flecha = tarjeta.tendencia === "down" ? ArrowDownRight : ArrowUpRight;
  const colorTendencia = tarjeta.tendencia === "down" ? "destructive" : "success";

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Resumen mensual</CardTitle>
          <CardDescription>{tarjeta.titulo}</CardDescription>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">
          {formatearValor(tarjeta.valor, inferirFormato(tarjeta.titulo, tarjeta.valor))}
        </p>
        {tieneTrend && (
          <div className="mt-3 flex items-center justify-between">
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                colorTendencia === "success" ? "text-success" : "text-destructive"
              )}
            >
              <Flecha className="h-4 w-4" />
              {Math.abs(tarjeta.comparacion_porcentaje ?? 0).toFixed(0)}% vs. mes anterior
            </span>
            <MiniTrendLine anterior={anterior!} actual={actual!} color={colorTendencia} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
