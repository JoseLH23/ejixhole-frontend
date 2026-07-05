import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  TrendingUp,
  CalendarCheck,
  CalendarClock,
  Wallet,
  XCircle,
  PieChart,
  Scale,
  UserPlus,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tarjeta } from "@/types/dashboard";
import { formatearValor, inferirFormato } from "./formatters";

const TENDENCIA_CONFIG = {
  up: { Icon: ArrowUpRight, className: "text-success" },
  down: { Icon: ArrowDownRight, className: "text-destructive" },
  neutral: { Icon: Minus, className: "text-muted-foreground" },
} as const;

/**
 * Icono + tinte por tarjeta — acoplado a los 9 títulos exactos que
 * genera DashboardService.resumen() en el backend, igual que ya
 * documenta formatters.ts para el formato de valor. Un título nuevo
 * simplemente cae al ícono genérico (BarChart3), sin romper nada.
 */
const ICONO_POR_TITULO: Record<string, { Icon: LucideIcon; tinte: string }> = {
  "Ingresos hoy": { Icon: DollarSign, tinte: "bg-primary/10 text-primary" },
  "Ingresos del mes": { Icon: TrendingUp, tinte: "bg-primary/10 text-primary" },
  "Reservaciones activas": { Icon: CalendarCheck, tinte: "bg-secondary/10 text-secondary" },
  "Próximas 7 días": { Icon: CalendarClock, tinte: "bg-secondary/10 text-secondary" },
  "Saldo pendiente total": { Icon: Wallet, tinte: "bg-warning/10 text-warning" },
  "Tasa de cancelación (mes)": { Icon: XCircle, tinte: "bg-destructive/10 text-destructive" },
  "Ocupación promedio (mes)": { Icon: PieChart, tinte: "bg-secondary/10 text-secondary" },
  "Diferencia de caja (hoy)": { Icon: Scale, tinte: "bg-wood/10 text-wood" },
  "Clientes nuevos (mes)": { Icon: UserPlus, tinte: "bg-primary/10 text-primary" },
};

/**
 * Renderiza CUALQUIERA de las tarjetas de /dashboard/resumen sin
 * lógica de negocio específica por tarjeta — todo lo que necesita
 * saber viene en el objeto `tarjeta` (contrato TarjetaOut del
 * backend). El ícono/tinte es puramente decorativo (ver mapa arriba).
 */
export function KpiCard({ tarjeta, delayMs = 0 }: { tarjeta: Tarjeta; delayMs?: number }) {
  const formato = inferirFormato(tarjeta.titulo, tarjeta.valor);
  const valorFormateado = formatearValor(tarjeta.valor, formato);
  const tendenciaInfo = tarjeta.tendencia ? TENDENCIA_CONFIG[tarjeta.tendencia] : null;
  const { Icon, tinte } = ICONO_POR_TITULO[tarjeta.titulo] ?? {
    Icon: BarChart3,
    tinte: "bg-muted text-muted-foreground",
  };

  return (
    <Card
      className="animate-fade-in-up transition-shadow duration-200 hover:shadow-premium-hover"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {tarjeta.titulo}
        </CardTitle>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tinte)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">{valorFormateado}</p>

        {tendenciaInfo && tarjeta.comparacion_porcentaje !== null ? (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-sm font-medium",
              tendenciaInfo.className
            )}
          >
            <tendenciaInfo.Icon className="h-4 w-4" />
            {Math.abs(tarjeta.comparacion_porcentaje).toFixed(1)}% vs. periodo anterior
          </p>
        ) : (
          // Espacio reservado para que las tarjetas sin comparación
          // mantengan la misma altura que las que sí comparan.
          <p className="mt-1 h-5 text-sm text-muted-foreground">&nbsp;</p>
        )}
      </CardContent>
    </Card>
  );
}
