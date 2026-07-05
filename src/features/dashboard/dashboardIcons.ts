import {
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

/**
 * Icono + tinte por tarjeta — acoplado a los 9 títulos exactos que
 * genera DashboardService.resumen() en el backend, igual que ya
 * documenta formatters.ts para el formato de valor. Un título nuevo
 * simplemente cae al ícono genérico (BarChart3), sin romper nada.
 */
export const ICONO_POR_TITULO: Record<string, { icon: LucideIcon; tinte: string }> = {
  "Ingresos hoy": { icon: DollarSign, tinte: "bg-primary/10 text-primary" },
  "Ingresos del mes": { icon: TrendingUp, tinte: "bg-primary/10 text-primary" },
  "Reservaciones activas": { icon: CalendarCheck, tinte: "bg-secondary/10 text-secondary" },
  "Próximas 7 días": { icon: CalendarClock, tinte: "bg-secondary/10 text-secondary" },
  "Saldo pendiente total": { icon: Wallet, tinte: "bg-warning/10 text-warning" },
  "Tasa de cancelación (mes)": { icon: XCircle, tinte: "bg-destructive/10 text-destructive" },
  "Ocupación promedio (mes)": { icon: PieChart, tinte: "bg-secondary/10 text-secondary" },
  "Diferencia de caja (hoy)": { icon: Scale, tinte: "bg-wood/10 text-wood" },
  "Clientes nuevos (mes)": { icon: UserPlus, tinte: "bg-primary/10 text-primary" },
};

export const ICONO_GENERICO = { icon: BarChart3, tinte: "bg-muted text-muted-foreground" };

export function obtenerIconoTarjeta(titulo: string) {
  return ICONO_POR_TITULO[titulo] ?? ICONO_GENERICO;
}
