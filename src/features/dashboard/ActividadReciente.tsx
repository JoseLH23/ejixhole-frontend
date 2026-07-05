import { CalendarClock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";

/**
 * "Actividad reciente" del Dashboard: próximas visitas confirmadas de
 * los siguientes 7 días. Reutiliza tal cual el hook/endpoint de
 * Reportes ya construido en la Entrega 3F (GET /reportes/proximas-
 * reservaciones) — no se creó ningún endpoint nuevo.
 *
 * Solo se monta para admin (ver DashboardPage.tsx) porque Reportes es
 * admin-only en el backend; llamarlo para operador/cajero daría 403.
 * Como este componente solo se renderiza condicionalmente desde el
 * padre, el hook nunca se ejecuta para esos roles — no hace falta
 * tocar el hook compartido de Reportes para agregarle un `enabled`.
 */
export function ActividadReciente() {
  const { data, isLoading } = useReporteProximasReservaciones({ dias: 7, estado: "confirmada" });

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "270ms" }}>
      <CardHeader>
        <CardTitle className="text-base">Actividad reciente</CardTitle>
        <CardDescription>Próximas visitas confirmadas (siguientes 7 días).</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-10 animate-shimmer rounded-md" />
            ))}
          </div>
        )}

        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState
            titulo="Sin visitas próximas"
            icon={CalendarClock}
            descripcion="No hay reservaciones confirmadas para los próximos 7 días."
          />
        )}

        {!isLoading && data && data.items.length > 0 && (
          <ul className="divide-y divide-border">
            {data.items.slice(0, 5).map((item) => (
              <li
                key={item.reservacion_id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.cliente_nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.servicio_nombre} · {item.fecha_visita} · {item.num_personas}{" "}
                    {item.num_personas === 1 ? "persona" : "personas"}
                  </p>
                </div>
                <EstadoBadge estado={item.estado} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
