import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Tarjeta } from "@/types/dashboard";
import { formatearValor, inferirFormato } from "./formatters";

/**
 * Tercer nivel de jerarquía: fila compacta (ícono + etiqueta + valor +
 * flecha de tendencia), no otra tarjeta cuadrada. Varias de estas
 * apiladas se sienten como una lista de datos densa, no como "más
 * tarjetas iguales" — es lo que le faltaba al Dashboard anterior.
 */
export function KpiCompact({
  tarjeta,
  icon: Icon,
  tinte,
}: {
  tarjeta: Tarjeta;
  icon: LucideIcon;
  tinte: string;
}) {
  const formato = inferirFormato(tarjeta.titulo, tarjeta.valor);
  const Flecha = tarjeta.tendencia === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tinte)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="flex-1 truncate text-sm text-muted-foreground">{tarjeta.titulo}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">
        {formatearValor(tarjeta.valor, formato)}
      </p>
      {tarjeta.tendencia && tarjeta.tendencia !== "neutral" && tarjeta.comparacion_porcentaje !== null && (
        <span
          className={cn(
            "flex items-center text-xs font-medium",
            tarjeta.tendencia === "up" ? "text-success" : "text-destructive"
          )}
        >
          <Flecha className="h-3.5 w-3.5" />
          {Math.abs(tarjeta.comparacion_porcentaje).toFixed(0)}%
        </span>
      )}
    </div>
  );
}
