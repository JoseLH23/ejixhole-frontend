import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientesListPage } from "@/features/clientes/ClientesListPage";
import { ServiciosListPage } from "@/features/servicios/ServiciosListPage";
import { ReservacionesListPage } from "@/features/reservaciones/ReservacionesListPage";
import { PagosListPage } from "@/features/pagos/PagosListPage";
import { CajaPage } from "@/features/caja/CajaPage";
import { ReportesHubPage } from "@/features/reportes/ReportesHubPage";
import { IngresosReportPage } from "@/features/reportes/IngresosReportPage";
import { CuentasPorCobrarReportPage } from "@/features/reportes/CuentasPorCobrarReportPage";
import { OcupacionReportPage } from "@/features/reportes/OcupacionReportPage";
import { ServiciosMasVendidosReportPage } from "@/features/reportes/ServiciosMasVendidosReportPage";
import { ClientesFrecuentesReportPage } from "@/features/reportes/ClientesFrecuentesReportPage";
import { ReservacionesPorEstadoReportPage } from "@/features/reportes/ReservacionesPorEstadoReportPage";
import { CancelacionesReportPage } from "@/features/reportes/CancelacionesReportPage";
import { TendenciaReservacionesReportPage } from "@/features/reportes/TendenciaReservacionesReportPage";
import { ClientesNuevosReportPage } from "@/features/reportes/ClientesNuevosReportPage";
import { ProximasReservacionesReportPage } from "@/features/reportes/ProximasReservacionesReportPage";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

export function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
