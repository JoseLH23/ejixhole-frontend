import { Link } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  PieChart,
  Award,
  Users,
  ListChecks,
  XCircle,
  LineChart,
  UserPlus,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ReporteLink {
  titulo: string;
  descripcion: string;
  path: string;
  icon: LucideIcon;
}

const REPORTES: ReporteLink[] = [
  { titulo: "Ingresos", descripcion: "Ingresos, reembolsos y neto por periodo.", path: "/reportes/ingresos", icon: TrendingUp },
  { titulo: "Cuentas por cobrar", descripcion: "Saldos pendientes por antigüedad.", path: "/reportes/cuentas-por-cobrar", icon: Wallet },
  { titulo: "Ocupación", descripcion: "% de ocupación promedio por servicio.", path: "/reportes/ocupacion", icon: PieChart },
  { titulo: "Servicios más vendidos", descripcion: "Ranking por reservaciones.", path: "/reportes/servicios-mas-vendidos", icon: Award },
  { titulo: "Clientes frecuentes", descripcion: "Quién reserva más seguido.", path: "/reportes/clientes-frecuentes", icon: Users },
  { titulo: "Reservaciones por estado", descripcion: "Conteo por pendiente/confirmada/completada/cancelada.", path: "/reportes/reservaciones-por-estado", icon: ListChecks },
  { titulo: "Cancelaciones", descripcion: "Tasa de cancelación y desglose.", path: "/reportes/cancelaciones", icon: XCircle },
  { titulo: "Tendencia de reservaciones", descripcion: "Volumen de reservaciones en el tiempo.", path: "/reportes/tendencia-reservaciones", icon: LineChart },
  { titulo: "Clientes nuevos", descripcion: "Registros nuevos por periodo.", path: "/reportes/clientes-nuevos", icon: UserPlus },
  { titulo: "Próximas reservaciones", descripcion: "Visitas próximas, sin filtro de periodo.", path: "/reportes/proximas-reservaciones", icon: CalendarClock },
];

export function ReportesHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Analítica del negocio — solo lectura.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTES.map((r) => (
          <Link key={r.path} to={r.path}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <r.icon className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-base">{r.titulo}</CardTitle>
                <CardDescription>{r.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
