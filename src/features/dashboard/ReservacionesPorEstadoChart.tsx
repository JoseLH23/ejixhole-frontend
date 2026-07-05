import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CHART_COLOR_POR_ESTADO, CHART_COLORS } from "@/lib/chartColors";
import { useReporteReservacionesPorEstado } from "@/features/reportes/useReportes";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendientes",
  confirmada: "Confirmadas",
  completada: "Completadas",
  cancelada: "Canceladas",
};

/** Real: GET /reportes/reservaciones-por-estado (mes actual). */
export function ReservacionesPorEstadoChart() {
  const { data, isLoading } = useReporteReservacionesPorEstado({ periodo: "mes" });

  const datos = data
    ? Object.entries(data.por_estado).map(([estado, cantidad]) => ({
        estado,
        nombre: ESTADO_LABEL[estado] ?? estado,
        cantidad,
      }))
    : [];

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reservaciones por estado</CardTitle>
        <CardDescription>Mes actual · {data?.total ?? 0} en total.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="skeleton-shimmer h-40 animate-shimmer rounded-full" />}

        {!isLoading && datos.length === 0 && <EmptyState titulo="Sin reservaciones este mes" />}

        {!isLoading && datos.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={datos} dataKey="cantidad" nameKey="nombre" innerRadius={38} outerRadius={62} paddingAngle={2}>
                    {datos.map((d) => (
                      <Cell key={d.estado} fill={CHART_COLOR_POR_ESTADO[d.estado] ?? CHART_COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5 text-sm">
              {datos.map((d) => (
                <li key={d.estado} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLOR_POR_ESTADO[d.estado] ?? CHART_COLORS.primary }}
                  />
                  <span className="text-muted-foreground">{d.nombre}</span>
                  <span className="font-medium">{d.cantidad}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
