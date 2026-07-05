import { AlertTriangle, Inbox } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDashboardResumen } from "./useDashboard";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

function formatearFecha(fechaIso: string): string {
  try {
    // "T00:00:00" fuerza a interpretar la fecha en hora local en vez
    // de UTC — evita que se muestre un día antes en husos horarios
    // negativos (ej. México).
    return format(new Date(`${fechaIso}T00:00:00`), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return fechaIso;
  }
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardResumen();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          Hola{usuario ? `, ${usuario.email}` : ""}
        </h1>
        {data && (
          <p className="text-sm text-muted-foreground">Resumen al {formatearFecha(data.fecha)}</p>
        )}
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && !isLoading && (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold">No se pudo cargar el Dashboard</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {(error as any)?.response?.data?.detail ??
              "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."}
          </p>
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Reintentando..." : "Reintentar"}
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.tarjetas.length === 0 && (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Todavía no hay datos</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuando empieces a registrar clientes, reservaciones y pagos, el resumen aparecerá aquí.
          </p>
        </div>
      )}

      {!isLoading && !isError && data && data.tarjetas.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.tarjetas.map((tarjeta) => (
            <KpiCard key={tarjeta.titulo} tarjeta={tarjeta} />
          ))}
        </div>
      )}
    </div>
  );
}
