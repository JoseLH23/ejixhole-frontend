import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CHART_COLORS } from "@/lib/chartColors";
import { useReporteIngresos } from "@/features/reportes/useReportes";

/** Real: GET /reportes/ingresos, rango fijo de los últimos 7 días, agrupado por día. */
export function IngresosUltimos7DiasChart() {
  const hoy = format(new Date(), "yyyy-MM-dd");
  const hace7dias = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const { data, isLoading } = useReporteIngresos({
    desde: hace7dias,
    hasta: hoy,
    agrupar_por: "dia",
  });

  const datos = (data?.serie ?? []).map((item) => ({ periodo: item.periodo, ingresos: Number(item.ingresos) }));

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ingresos últimos 7 días</CardTitle>
        <CardDescription>
          {hace7dias} — {hoy}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="skeleton-shimmer h-48 animate-shimmer rounded-lg" />}

        {!isLoading && datos.length === 0 && <EmptyState titulo="Sin ingresos en este rango" />}

        {!isLoading && datos.length > 0 && (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="ingresos" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
