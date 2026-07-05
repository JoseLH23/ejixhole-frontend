import { Circle, Server, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEstadoSistema } from "@/hooks/useEstadoSistema";

interface DashboardSidePanelProps {
  /** Timestamp real de React Query (dataUpdatedAt) — no una hora inventada. */
  ultimaActualizacion: number;
}

/**
 * "Estado del sistema" — Entrega 8: se quitó la tarjeta de foto que
 * tenía en la Entrega 7 (en la nueva referencia, ese tipo de tarjeta
 * vive en el Sidebar, que está fuera de alcance de esta entrega).
 *
 * Nota de precisión (se mantiene desde la Entrega 7): `GET /status`
 * solo confirma que el proceso de FastAPI responde — NO verifica la
 * base de datos por separado. Por eso hay un único indicador "API
 * backend", no uno inventado de "Base de datos".
 */
export function DashboardSidePanel({ ultimaActualizacion }: DashboardSidePanelProps) {
  const { enLinea } = useEstadoSistema();

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estado del sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Server className="h-4 w-4" /> API backend
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 font-medium",
              enLinea ? "text-success" : "text-destructive"
            )}
          >
            <Circle className="h-2 w-2 fill-current" />
            {enLinea ? "En línea" : "Sin conexión"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" /> Última sincronización
          </span>
          <span className="font-medium">
            {formatDistanceToNow(ultimaActualizacion, { addSuffix: true, locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
