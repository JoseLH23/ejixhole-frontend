import { CalendarClock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";

/**
 * "Actividad reciente" del Dashboard — rediseñada como timeline (línea
 * conectora + puntos), no una lista plana. Reutiliza tal cual el
 * hook/endpoint de Reportes ya construido en la Entrega 3F
 * (GET /reportes/proximas-reservaciones) — no se creó ningún endpoint
 * nuevo. Solo se monta para admin (ver DashboardPage.tsx) porque
 * Reportes es admin-only en el backend.
 */
export function ActividadReciente() {
  const { data, isLoading } = useReporteProximasReservaciones({ dias: 7, estado: "confirmada" });

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "270ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Actividad reciente</CardTitle>
        <CardDescription>Próximas visitas confirmadas (siguientes 7 días).</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-12 animate-shimmer rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState
            titulo="Sin visitas confirmadas"
            icon={CalendarClock}
            descripcion="Solo cuenta lo ya confirmado. Si tienes solicitudes del portal público pendientes, acéptalas en Reservaciones para que aparezcan aquí."
          />
        )}

        {!isLoading && data && data.items.length > 0 && (
          <ol className="relative ml-2 space-y-6 border-l border-border pl-6">
            {data.items.slice(0, 5).map((item) => (
              <li key={item.reservacion_id} className="relative">
                <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-card bg-secondary" />
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.cliente_nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.servicio_nombre} · {item.fecha_visita} · {item.num_personas}{" "}
                      {item.num_personas === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                  <EstadoBadge estado={item.estado} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
