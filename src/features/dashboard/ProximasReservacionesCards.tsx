import { Home, Tent, Waves, Calendar } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";

/**
 * Íconos por palabra clave del nombre real del servicio — NO fotos.
 * El backend no tiene una foto por servicio/cabaña, así que usar una
 * imagen genérica de "cabaña" al lado de una reservación real habría
 * insinuado que es una foto de esa cabaña específica, lo cual sería
 * engañoso. Un ícono no hace esa promesa.
 */
function iconoPorServicio(nombreServicio: string) {
  const texto = nombreServicio.toLowerCase();
  if (texto.includes("caban") || texto.includes("cabañ")) return Home;
  if (texto.includes("camping") || texto.includes("acampar")) return Tent;
  if (texto.includes("cascada") || texto.includes("agua") || texto.includes("kayak") || texto.includes("tubing"))
    return Waves;
  return Calendar;
}

/**
 * Usa el mismo endpoint real que ActividadReciente
 * (GET /reportes/proximas-reservaciones) — React Query comparte la
 * cache entre ambos componentes automáticamente (misma queryKey), así
 * que esto no genera una segunda petición de red.
 */
export function ProximasReservacionesCards() {
  const { data, isLoading } = useReporteProximasReservaciones({ dias: 7, estado: "confirmada" });

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Próximas reservaciones</CardTitle>
          <CardDescription>Confirmadas para los siguientes 7 días.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-16 animate-shimmer rounded-lg" />
          ))}

        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <EmptyState
            titulo="Sin reservaciones confirmadas"
            icon={Calendar}
            descripcion="Acepta solicitudes pendientes del portal en Reservaciones para verlas aquí."
          />
        )}

        {!isLoading &&
          data?.items.slice(0, 4).map((item) => {
            const Icon = iconoPorServicio(item.servicio_nombre);
            return (
              <div
                key={item.reservacion_id}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.servicio_nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.fecha_visita} · {item.cliente_nombre} · {item.num_personas}{" "}
                    {item.num_personas === 1 ? "persona" : "personas"}
                  </p>
                </div>
                <EstadoBadge estado={item.estado} />
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
