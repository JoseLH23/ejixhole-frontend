import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { LoginPage } from "@/features/auth/LoginPage";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

/**
 * Code-splitting por ruta (mejora de tiempo de carga): cada módulo se
 * descarga solo cuando el usuario navega ahí, en vez de bajar los 8
 * módulos completos (+ Recharts, usado en Dashboard y 4 reportes) de
 * golpe al iniciar sesión. `npm run build` avisaba de un bundle único
 * de ~1 MB — esto lo reparte en chunks bajo demanda.
 *
 * Login, AppShell y los guards de rutas quedan fuera del lazy-loading
 * a propósito: son pequeños y se necesitan de inmediato.
 */
const DashboardPage = React.lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const ClientesListPage = React.lazy(() =>
  import("@/features/clientes/ClientesListPage").then((m) => ({ default: m.ClientesListPage }))
);
const ServiciosListPage = React.lazy(() =>
  import("@/features/servicios/ServiciosListPage").then((m) => ({ default: m.ServiciosListPage }))
);
const ReservacionesListPage = React.lazy(() =>
  import("@/features/reservaciones/ReservacionesListPage").then((m) => ({ default: m.ReservacionesListPage }))
);
const PagosListPage = React.lazy(() =>
  import("@/features/pagos/PagosListPage").then((m) => ({ default: m.PagosListPage }))
);
const CajaPage = React.lazy(() =>
  import("@/features/caja/CajaPage").then((m) => ({ default: m.CajaPage }))
);
const ReportesHubPage = React.lazy(() =>
  import("@/features/reportes/ReportesHubPage").then((m) => ({ default: m.ReportesHubPage }))
);
const IngresosReportPage = React.lazy(() =>
  import("@/features/reportes/IngresosReportPage").then((m) => ({ default: m.IngresosReportPage }))
);
const CuentasPorCobrarReportPage = React.lazy(() =>
  import("@/features/reportes/CuentasPorCobrarReportPage").then((m) => ({ default: m.CuentasPorCobrarReportPage }))
);
const OcupacionReportPage = React.lazy(() =>
  import("@/features/reportes/OcupacionReportPage").then((m) => ({ default: m.OcupacionReportPage }))
);
const ServiciosMasVendidosReportPage = React.lazy(() =>
  import("@/features/reportes/ServiciosMasVendidosReportPage").then((m) => ({
    default: m.ServiciosMasVendidosReportPage,
  }))
);
const ClientesFrecuentesReportPage = React.lazy(() =>
  import("@/features/reportes/ClientesFrecuentesReportPage").then((m) => ({
    default: m.ClientesFrecuentesReportPage,
  }))
);
const ReservacionesPorEstadoReportPage = React.lazy(() =>
  import("@/features/reportes/ReservacionesPorEstadoReportPage").then((m) => ({
    default: m.ReservacionesPorEstadoReportPage,
  }))
);
const CancelacionesReportPage = React.lazy(() =>
  import("@/features/reportes/CancelacionesReportPage").then((m) => ({ default: m.CancelacionesReportPage }))
);
const TendenciaReservacionesReportPage = React.lazy(() =>
  import("@/features/reportes/TendenciaReservacionesReportPage").then((m) => ({
    default: m.TendenciaReservacionesReportPage,
  }))
);
const ClientesNuevosReportPage = React.lazy(() =>
  import("@/features/reportes/ClientesNuevosReportPage").then((m) => ({ default: m.ClientesNuevosReportPage }))
);
const ProximasReservacionesReportPage = React.lazy(() =>
  import("@/features/reportes/ProximasReservacionesReportPage").then((m) => ({
    default: m.ProximasReservacionesReportPage,
  }))
);

function CargandoModulo() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<CargandoModulo />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/no-autorizado" element={<UnauthorizedPage />} />

              <Route element={<RequireRole roles={["admin", "operador"]} />}>
                <Route path="/clientes" element={<ClientesListPage />} />
                <Route path="/reservaciones" element={<ReservacionesListPage />} />
              </Route>

              <Route element={<RequireRole roles={["admin"]} />}>
                <Route path="/servicios" element={<ServiciosListPage />} />
                <Route path="/reportes" element={<ReportesHubPage />} />
                <Route path="/reportes/ingresos" element={<IngresosReportPage />} />
                <Route path="/reportes/cuentas-por-cobrar" element={<CuentasPorCobrarReportPage />} />
                <Route path="/reportes/ocupacion" element={<OcupacionReportPage />} />
                <Route path="/reportes/servicios-mas-vendidos" element={<ServiciosMasVendidosReportPage />} />
                <Route path="/reportes/clientes-frecuentes" element={<ClientesFrecuentesReportPage />} />
                <Route path="/reportes/reservaciones-por-estado" element={<ReservacionesPorEstadoReportPage />} />
                <Route path="/reportes/cancelaciones" element={<CancelacionesReportPage />} />
                <Route path="/reportes/tendencia-reservaciones" element={<TendenciaReservacionesReportPage />} />
                <Route path="/reportes/clientes-nuevos" element={<ClientesNuevosReportPage />} />
                <Route path="/reportes/proximas-reservaciones" element={<ProximasReservacionesReportPage />} />
                <Route path="/usuarios" element={<ComingSoonPage titulo="Usuarios" />} />
              </Route>

              <Route element={<RequireRole roles={["admin", "cajero"]} />}>
                <Route path="/pagos" element={<PagosListPage />} />
              </Route>

              <Route element={<RequireRole roles={["admin", "operador", "cajero"]} />}>
                <Route path="/caja" element={<CajaPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
