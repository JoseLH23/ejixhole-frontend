import { useLocation } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { Menu, Search, Circle, ChevronRight } from "lucide-react";

import { useEstadoSistema } from "@/hooks/useEstadoSistema";
import { encontrarSeccionActual } from "@/router/breadcrumb";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onAbrirMenu: () => void;
  onAbrirPaleta: () => void;
}

/**
 * Chrome mínimo estilo Linear. El bloque de usuario/avatar/logout que
 * vivía aquí se movió al final del Sidebar (a pedido explícito, tras
 * la Entrega 8) — se quitó por completo de este archivo para que no
 * exista en dos lugares a la vez. Lo que queda: menú mobile, contexto
 * de sección, disparador de ⌘K, estado real del sistema, y la barra
 * de carga global.
 */
export function Topbar({ onAbrirMenu, onAbrirPaleta }: TopbarProps) {
  const location = useLocation();
  const { enLinea } = useEstadoSistema();
  const seccion = encontrarSeccionActual(location.pathname);

  const numeroDeFetchesActivos = useIsFetching();

  return (
    <header className="relative flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      <button
        onClick={onAbrirMenu}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Contexto de sección — liviano, no repite el <h1> de cada página */}
      {seccion && (
        <div className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
          <seccion.icon className="h-3.5 w-3.5" />
          <span>{seccion.label}</span>
          {location.pathname !== seccion.path && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">
                {location.pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ")}
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Disparador de la paleta de comandos */}
      <button
        onClick={onAbrirPaleta}
        className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        Buscar
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      {/* Estado del sistema — real, contra GET /status */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Circle className={cn("h-2 w-2 fill-current", enLinea ? "text-success" : "text-destructive")} />
        <span className="hidden lg:inline">{enLinea ? "En línea" : "Sin conexión"}</span>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-opacity duration-300",
          numeroDeFetchesActivos > 0 ? "w-full opacity-100 animate-pulse" : "w-0 opacity-0"
        )}
      />
    </header>
  );
}
