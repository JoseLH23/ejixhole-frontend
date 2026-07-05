import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tarjeta } from "@/types/dashboard";
import { formatearValor, inferirFormato } from "./formatters";
import { TrendBar } from "./TrendBar";

/**
 * Tarjeta "destacada" — segundo nivel de jerarquía (después del hero).
 * Reutiliza exactamente el mismo objeto Tarjeta del backend, solo con
 * más presencia visual: ícono grande, tinte de fondo, y la barra de
 * tendencia real.
 */
export function KpiFeatured({
  tarjeta,
  icon: Icon,
  tinte,
  delayMs = 0,
}: {
  tarjeta: Tarjeta;
  icon: LucideIcon;
  tinte: string;
  delayMs?: number;
}) {
  const formato = inferirFormato(tarjeta.titulo, tarjeta.valor);

  return (
    <Card
      className="animate-fade-in-up flex-1 transition-shadow duration-200 hover:shadow-premium-hover"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{tarjeta.titulo}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {formatearValor(tarjeta.valor, formato)}
            </p>
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tinte)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <TrendBar tendencia={tarjeta.tendencia} porcentaje={tarjeta.comparacion_porcentaje} />
      </CardContent>
    </Card>
  );
}
