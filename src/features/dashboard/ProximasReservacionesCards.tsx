import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Calendar, Home, Tent, Waves } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReporteProximasReservaciones } from "@/features/reportes/useReportes";

function iconoPorServicio(nombreServicio: string) {
  const texto = nombreServicio.toLowerCase();
  if (texto.includes("caban") || texto.includes("cabañ")) return Home;
  if (texto.includes("camping") || texto.includes("acampar")) return Tent;
  if (texto.includes("cascada") || texto.includes("agua") || texto.includes("kayak") || texto.includes("tubing"))
    return Waves;
  return Calendar;
}

function etiquetaFecha(fecha: string) {
  try {
    const valor = parseISO(fecha);
    if (isToday(valor)) return "Hoy";
    if (isTomorrow(valor)) return "Mañana";
    return format(valor, "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return fecha;
  }
}

/**
 * Primera agenda operativa del Control Center. Usa datos reales del endpoint
 * GET /reportes/proximas-reservaciones y agrupa las llegadas confirmadas por día.
 */
export function ProximasReservacionesCards() {
  const { data, isLoading } = useReporteProximasReservaciones({ dias: 7, estado: "confirmada" });
  const items = data?.items ?? [];

  const grupos = Array.from(
    items.reduce((mapa, item) => {
      const existentes = mapa.get(item.fecha_visita) ?? [];
      existentes.push(item);
      mapa.set(item.fecha_visita, existentes);
      return mapa;
    }, new Map<string, typeof items>())
  )
    .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
    .slice(0, 4);

  return (
    <Card className="h-full animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">Agenda operativa</CardTitle>
          <CardDescription>Llegadas confirmadas para los siguientes 7 días.</CardDescription>
        </div>
        <Link
          to="/reservaciones"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-20 animate-shimmer rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <EmptyState
            titulo="Sin llegadas confirmadas"
            icon={Calendar}
            descripcion="Acepta solicitudes pendientes del portal para ver la agenda de operación aquí."
          />
        )}

        {!isLoading && grupos.length > 0 && (
          <div className="space-y-4">
            {grupos.map(([fecha, reservaciones]) => {
              const totalPersonas = reservaciones.reduce((total, item) => total + item.num_personas, 0);
              const visibles = reservaciones.slice(0, 2);
              const restantes = reservaciones.length - visibles.length;

              return (
                <section key={fecha} className="relative pl-4">
                  <span className="absolute bottom-0 left-0 top-1 w-px bg-border" aria-hidden="true" />
                  <span className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />

                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold capitalize text-foreground">{etiquetaFecha(fecha)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {reservaciones.length} {reservaciones.length === 1 ? "reservación" : "reservaciones"} · {totalPersonas}{" "}
                      {totalPersonas === 1 ? "persona" : "personas"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {visibles.map((item) => {
                      const Icon = iconoPorServicio(item.servicio_nombre);
                      return (
                        <div
                          key={item.reservacion_id}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5 transition-colors hover:bg-accent/40"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{item.servicio_nombre}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.cliente_nombre} · {item.num_personas} {item.num_personas === 1 ? "persona" : "personas"}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {restantes > 0 && (
                      <p className="pl-1 text-xs font-medium text-primary">
                        +{restantes} {restantes === 1 ? "llegada más" : "llegadas más"} este día
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
