import { Circle, Server, Globe, Monitor, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEstadoSistemas } from "@/hooks/useEstadoSistema";

interface DashboardSidePanelProps {
  /** Timestamp real de React Query (dataUpdatedAt) — no una hora inventada. */
  ultimaActualizacion: number;
}

const ICONOS: Record<string, typeof Server> = {
  backend: Server,
  portal: Globe,
  frontend: Monitor,
};

const ESTADO_COLOR: Record<string, string> = {
  en_linea: "text-success",
  degradado: "text-warning",
  sin_conexion: "text-destructive",
};

const ESTADO_LABEL: Record<string, string> = {
  en_linea: "En línea",
  degradado: "Degradado",
  sin_conexion: "Sin conexión",
};

/**
 * "Estado del sistema" — ahora verifica los 3 sistemas reales del
 * ecosistema (backend, portal público, frontend administrativo) en
 * vez de solo el backend. Ver useEstadoSistemas.ts para el detalle
 * exacto de cómo se verifica cada uno por HTTP.
 */
export function DashboardSidePanel({ ultimaActualizacion }: DashboardSidePanelProps) {
  const { sistemas } = useEstadoSistemas();

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Estado del sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {sistemas.map((s) => {
          const Icon = ICONOS[s.id] ?? Server;
          return (
            <div key={s.id} className="flex items-center justify-between border-t border-border pt-2 first:border-t-0 first:pt-0">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {s.nombre}
              </span>
              <span className={cn("flex items-center gap-1.5 font-medium", ESTADO_COLOR[s.estado])}>
                <Circle className="h-2 w-2 fill-current" />
                {ESTADO_LABEL[s.estado]}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" /> Última sincronización
          </span>
          <span className="font-medium">
            {formatDistanceToNow(ultimaActualizacion, { addSuffix: true, locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
