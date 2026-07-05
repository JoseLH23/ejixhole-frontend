import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReporteServiciosMasVendidos } from "@/features/reportes/useReportes";

/**
 * Real: GET /reportes/servicios-mas-vendidos (mes actual). El % de
 * cada barra es la proporción de reservaciones de ESE servicio contra
 * el total de los servicios mostrados aquí (top 4) — un cálculo real
 * sobre datos reales, no un número inventado.
 */
export function ServiciosMasVendidosPanel() {
  const { data, isLoading } = useReporteServiciosMasVendidos({ periodo: "mes", limit: 4 });

  const total = data?.items.reduce((suma, item) => suma + item.num_reservaciones, 0) ?? 0;

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Servicios más vendidos</CardTitle>
        <CardDescription>Por número de reservaciones (mes actual).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-8 animate-shimmer rounded-md" />
          ))}

        {!isLoading && (data?.items.length ?? 0) === 0 && <EmptyState titulo="Sin ventas este mes" />}

        {!isLoading &&
          data?.items.map((item) => {
            const porcentaje = total > 0 ? Math.round((item.num_reservaciones / total) * 100) : 0;
            return (
              <div key={item.servicio_id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate">{item.servicio_nombre}</span>
                  <span className="font-medium text-muted-foreground">{porcentaje}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${porcentaje}%` }} />
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
