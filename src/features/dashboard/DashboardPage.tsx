import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Inbox } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardResumen } from "./useDashboard";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { ActividadReciente } from "./ActividadReciente";

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
  const { usuario, tieneRol } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardResumen();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          Hola{usuario ? `, ${usuario.email.split("@")[0]}` : ""} 🌿
        </h1>
        {data && (
          <p className="text-sm text-muted-foreground">Resumen al {formatearFecha(data.fecha)}</p>
        )}
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && !isLoading && (
        <ErrorState
          titulo="No se pudo cargar el Dashboard"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      )}

      {!isLoading && !isError && data && data.tarjetas.length === 0 && (
        <EmptyState
          titulo="Todavía no hay datos"
          icon={Inbox}
          descripcion="Cuando empieces a registrar clientes, reservaciones y pagos, el resumen aparecerá aquí."
        />
      )}

      {!isLoading && !isError && data && data.tarjetas.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tarjetas.map((tarjeta, i) => (
              <KpiCard key={tarjeta.titulo} tarjeta={tarjeta} delayMs={i * 40} />
            ))}
          </div>

          {/* Solo admin: Reportes (de donde sale esta sección) es
              admin-only en el backend — ver ActividadReciente.tsx. */}
          {tieneRol(["admin"]) && <ActividadReciente />}
        </>
      )}
    </div>
  );
}
