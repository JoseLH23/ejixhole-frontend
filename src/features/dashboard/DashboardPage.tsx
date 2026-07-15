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
import { DashboardWorkspace, type DashboardWidget } from "./DashboardWorkspace";
import { KpiRowCard } from "./KpiRowCard";
import { ResumenMensualCard } from "./ResumenMensualCard";
import { ServiciosMasVendidosPanel } from "./ServiciosMasVendidosPanel";
import { ActividadReciente } from "./ActividadReciente";
import { ProximasReservacionesCards } from "./ProximasReservacionesCards";
import { ReservacionesPorEstadoChart } from "./ReservacionesPorEstadoChart";
import { IngresosUltimos7DiasChart } from "./IngresosUltimos7DiasChart";
import { obtenerIconoTarjeta } from "./dashboardIcons";
import { nombreVisible } from "@/lib/nombreUsuario";

const TITULOS_KPI_ROW = ["Clientes nuevos (mes)", "Reservaciones activas", "Ingresos hoy", "Diferencia de caja (hoy)"];

export function DashboardPage() {
  const { usuario, tieneRol } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useDashboardResumen();

  const nombre = usuario ? usuario.nombre?.trim() || nombreVisible(usuario.email) : "";
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

  const widgets: DashboardWidget[] = [];

  if (kpisRow.length > 0) {
    widgets.push({
      id: "indicadores-principales",
      titulo: "Indicadores principales",
      descripcion: "Resumen rápido de clientes, reservaciones, ingresos y caja.",
      categoria: "Dirección",
      tamanosPermitidos: ["grande"],
      tamanoInicial: "grande",
      contenido: (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {kpisRow.map((tarjeta) => {
            const { icon, tinte } = obtenerIconoTarjeta(tarjeta.titulo);
            return <KpiRowCard key={tarjeta.titulo} tarjeta={tarjeta} icon={icon} tinte={tinte} />;
          })}
        </div>
      ),
    });
  }

  widgets.push({
    id: "estado-operativo",
    titulo: "Estado operativo",
    descripcion: "Estado del sistema, resumen mensual y servicios con mayor movimiento.",
    categoria: "Operación",
    tamanosPermitidos: ["grande"],
    tamanoInicial: "grande",
    contenido: (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <DashboardSidePanel ultimaActualizacion={dataUpdatedAt} />
        <ResumenMensualCard tarjeta={ingresosDelMes} />
        {esAdmin ? <ServiciosMasVendidosPanel /> : <div className="hidden lg:block" />}
      </div>
    ),
  });

  if (esAdmin) {
    widgets.push(
      {
        id: "actividad-reciente",
        titulo: "Actividad reciente",
        descripcion: "Últimos movimientos importantes registrados en el sistema.",
        categoria: "Operación",
        tamanosPermitidos: ["mediano", "grande"],
        tamanoInicial: "mediano",
        contenido: <ActividadReciente />,
      },
      {
        id: "proximas-reservaciones",
        titulo: "Próximas reservaciones",
        descripcion: "Llegadas y visitas próximas que necesitan preparación.",
        categoria: "Reservaciones",
        tamanosPermitidos: ["mediano", "grande"],
        tamanoInicial: "mediano",
        contenido: <ProximasReservacionesCards />,
      },
      {
        id: "reservaciones-por-estado",
        titulo: "Reservaciones por estado",
        descripcion: "Distribución actual de reservaciones según su estado.",
        categoria: "Reportes",
        tamanosPermitidos: ["mediano", "grande"],
        tamanoInicial: "mediano",
        contenido: <ReservacionesPorEstadoChart />,
      },
      {
        id: "ingresos-ultimos-dias",
        titulo: "Ingresos de los últimos 7 días",
        descripcion: "Tendencia reciente de ingresos para detectar cambios rápidamente.",
        categoria: "Finanzas",
        tamanosPermitidos: ["mediano", "grande"],
        tamanoInicial: "mediano",
        contenido: <IngresosUltimos7DiasChart />,
      }
    );
  }

  const scopeUsuario = usuario?.email?.toLowerCase() || "usuario";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Circle className="h-2 w-2 fill-current" />
          Sistema operativo
        </span>
        <span className="text-sm capitalize text-muted-foreground">{fechaFormateada}</span>
      </div>

      <DashboardHero nombre={nombre} />

      <DashboardWorkspace widgets={widgets} storageScope={scopeUsuario} />

      {!esAdmin && (
        <p className={cn("text-center text-xs text-muted-foreground")}>
          Algunas secciones (actividad, próximas reservaciones y reportes) requieren rol de administrador.
        </p>
      )}
    </div>
  );
}
