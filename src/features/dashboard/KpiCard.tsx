import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tarjeta } from "@/types/dashboard";
import { formatearValor, inferirFormato } from "./formatters";

const TENDENCIA_CONFIG = {
  up: { Icon: ArrowUpRight, className: "text-emerald-600" },
  down: { Icon: ArrowDownRight, className: "text-destructive" },
  neutral: { Icon: Minus, className: "text-muted-foreground" },
} as const;

/**
 * Renderiza CUALQUIERA de las tarjetas de /dashboard/resumen sin
 * lógica específica por tarjeta — todo lo que necesita saber viene en
 * el objeto `tarjeta` (contrato TarjetaOut del backend). Cuando el
 * backend agregue más tarjetas en el futuro, este componente no
 * cambia.
 */
export function KpiCard({ tarjeta }: { tarjeta: Tarjeta }) {
  const formato = inferirFormato(tarjeta.titulo, tarjeta.valor);
  const valorFormateado = formatearValor(tarjeta.valor, formato);

  const tendenciaInfo = tarjeta.tendencia ? TENDENCIA_CONFIG[tarjeta.tendencia] : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {tarjeta.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">{valorFormateado}</p>

        {tendenciaInfo && tarjeta.comparacion_porcentaje !== null ? (
          <p className={cn("mt-1 flex items-center gap-1 text-sm font-medium", tendenciaInfo.className)}>
            <tendenciaInfo.Icon className="h-4 w-4" />
            {Math.abs(tarjeta.comparacion_porcentaje).toFixed(1)}% vs. periodo anterior
          </p>
        ) : (
          // Espacio reservado para que las tarjetas sin comparación
          // (Reservaciones activas, Próximas 7 días, etc.) mantengan
          // la misma altura que las que sí comparan.
          <p className="mt-1 h-5 text-sm text-muted-foreground">&nbsp;</p>
        )}
      </CardContent>
    </Card>
  );
}
