import { Inbox } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardResumen } from "./useDashboard";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardHero } from "./DashboardHero";
import { ActividadReciente } from "./ActividadReciente";

// Títulos ya destacados dentro del hero — no se repiten en el grid de
// abajo. Mismo acoplamiento por título ya documentado en DashboardHero.tsx.
const TITULOS_EN_HERO = new Set(["Ingresos del mes", "Reservaciones activas", "Clientes nuevos (mes)"]);

export function DashboardPage() {
  const { usuario, tieneRol } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardResumen();

  const nombre = usuario?.email.split("@")[0] ?? "";

  return (
    <div className="space-y-6">
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
          <DashboardHero nombre={nombre} fecha={data.fecha} tarjetas={data.tarjetas} />

          {/* Grid de las 6 tarjetas restantes — la diferenciación visual
              ya viene del hero de arriba, así que aquí se mantiene una
              cuadrícula limpia en vez de forzar tamaños mixtos que no
              dividen parejo (6 cartas ya arman un 3×2 ordenado). */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tarjetas
              .filter((t) => !TITULOS_EN_HERO.has(t.titulo))
              .map((tarjeta, i) => (
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
