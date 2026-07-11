import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Circle, Inbox } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { useDashboardResumen } from "./useDashboard";
import { DashboardHero } from "./DashboardHero";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardSidePanel } from "./DashboardSidePanel";
import { KpiRowCard } from "./KpiRowCard";
import { ResumenMensualCard } from "./ResumenMensualCard";
import { ServiciosMasVendidosPanel } from "./ServiciosMasVendidosPanel";
import { ActividadReciente } from "./ActividadReciente";
import { ProximasReservacionesCards } from "./ProximasReservacionesCards";
import { ReservacionesPorEstadoChart } from "./ReservacionesPorEstadoChart";
import { IngresosUltimos7DiasChart } from "./IngresosUltimos7DiasChart";
import { obtenerIconoTarjeta } from "./dashboardIcons";

/**
 * KPIs de la fila principal — 4 tarjetas reales de /dashboard/resumen.
 *
 * Nota de honestidad importante: la referencia visual pedía
 * "Visitantes hoy" y "Caja actual", pero NINGUNA de las 2 existe en
 * /dashboard/resumen (los 9 títulos reales son fijos, ver
 * app/services/dashboard_service.py del backend). Se sustituyeron por
 * los equivalentes reales más cercanos:
 *   "Visitantes hoy" → "Clientes nuevos (mes)" (única métrica real de personas)
 *   "Caja actual"    → "Diferencia de caja (hoy)" (única métrica real de caja en este endpoint)
 */
const TITULOS_KPI_ROW = ["Clientes nuevos (mes)", "Reservaciones activas", "Ingresos hoy", "Diferencia de caja (hoy)"];

export function DashboardPage() {
  const { usuario, tieneRol } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useDashboardResumen();

  const nombre = usuario?.email.split("@")[0] ?? "";
  const esAdmin = tieneRol(["admin"]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudo cargar el Dashboard"
        error={error}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  if (!data || data.tarjetas.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no hay datos"
        icon={Inbox}
        descripcion="Cuando empieces a registrar clientes, reservaciones y pagos, el resumen aparecerá aquí."
      />
    );
  }

  const kpisRow = TITULOS_KPI_ROW.map((titulo) => data.tarjetas.find((t) => t.titulo === titulo)).filter(
    (t): t is NonNullable<typeof t> => t !== undefined
  );
  const ingresosDelMes = data.tarjetas.find((t) => t.titulo === "Ingresos del mes");

  const fechaFormateada = (() => {
    try {
      return format(new Date(`${data.fecha}T00:00:00`), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return data.fecha;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Franja superior: "Parque Abierto" es decorativo — el backend no
          tiene un concepto de "parque abierto/cerrado" en tiempo real,
          solo si el servidor responde (eso ya se muestra abajo, real). */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Circle className="h-2 w-2 fill-current" />
          Parque Abierto
        </span>
        <span className="text-sm capitalize text-muted-foreground">{fechaFormateada}</span>
      </div>

      <DashboardHero nombre={nombre} />

      {/* Fila de KPIs — 4 tarjetas reales uniformes */}
      {kpisRow.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpisRow.map((tarjeta) => {
            const { icon, tinte } = obtenerIconoTarjeta(tarjeta.titulo);
            return <KpiRowCard key={tarjeta.titulo} tarjeta={tarjeta} icon={icon} tinte={tinte} />;
          })}
        </div>
      )}

      {/* Cuerpo en 3 columnas (12 cols): actividad + próximas + panel derecho.
          Actividad/Próximas dependen de Reportes (admin-only) — para
          operador/cajero se omiten con honestidad, no se rellenan con
          datos falsos. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-4">{esAdmin && <ActividadReciente />}</div>
        <div className="min-w-0 space-y-6 lg:col-span-5">{esAdmin && <ProximasReservacionesCards />}</div>
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <DashboardSidePanel ultimaActualizacion={dataUpdatedAt} />
          <ResumenMensualCard tarjeta={ingresosDelMes} />
          {esAdmin && <ServiciosMasVendidosPanel />}
        </div>
      </div>

      {/* Sección inferior — también depende de Reportes, admin-only. */}
      {esAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <ReservacionesPorEstadoChart />
          </div>
          <div className="min-w-0">
            <IngresosUltimos7DiasChart />
          </div>
        </div>
      )}

      {!esAdmin && (
        <p className={cn("text-center text-xs text-muted-foreground")}>
          Algunas secciones (actividad, próximas reservaciones, reportes) requieren rol de administrador.
        </p>
      )}
    </div>
  );
}
