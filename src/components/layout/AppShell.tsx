import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const [menuAbierto, setMenuAbierto] = React.useState(false);
  const location = useLocation();

  // Cierra el menú mobile automáticamente al navegar a otra ruta —
  // evita que quede abierto tapando la pantalla tras elegir una opción.
  React.useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar abiertoEnMobile={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
