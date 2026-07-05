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
              <Route path="/reportes" element={<ComingSoonPage titulo="Reportes" />} />
              <Route path="/usuarios" element={<ComingSoonPage titulo="Usuarios" />} />
            </Route>

            <Route element={<RequireRole roles={["admin", "cajero"]} />}>
              <Route path="/pagos" element={<PagosListPage />} />
            </Route>

            <Route element={<RequireRole roles={["admin", "operador", "cajero"]} />}>
              <Route path="/caja" element={<ComingSoonPage titulo="Caja" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
