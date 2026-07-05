import { useLocation, useNavigate } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { LogOut, ChevronDown, Menu, Search, Circle, ChevronRight } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useEstadoSistema } from "@/hooks/useEstadoSistema";
import { encontrarSeccionActual } from "@/router/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ROL_LABELS: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  cajero: "Cajero",
};

function inicialesDe(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

interface TopbarProps {
  onAbrirMenu: () => void;
  onAbrirPaleta: () => void;
}

/**
 * Rediseño total (Entrega 6): chrome mínimo al estilo Linear — se
 * quitó el saludo/hora/búsqueda embebida que hacían sentir esto como
 * "otro panel de admin genérico". Lo que queda: contexto de sección
 * (breadcrumb liviano), un disparador de la paleta de comandos, el
 * estado real del sistema, y el menú de usuario.
 */
export function Topbar({ onAbrirMenu, onAbrirPaleta }: TopbarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enLinea } = useEstadoSistema();
  const seccion = encontrarSeccionActual(location.pathname);

  const numeroDeFetchesActivos = useIsFetching();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
        <Circle className={cn("h-2 w-2 fill-current", enLinea ? "text-success" : "text-destructive")} />
        {enLinea ? "En línea" : "Sin conexión"}
      </div>

      {usuario && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 outline-none transition-colors hover:bg-accent">
            <Avatar className="h-7 w-7 ring-2 ring-primary/10">
              <AvatarFallback className="text-xs">{inicialesDe(usuario.email)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-normal">{usuario.email}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {ROL_LABELS[usuario.rol] ?? usuario.rol}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-opacity duration-300",
          numeroDeFetchesActivos > 0 ? "w-full opacity-100 animate-pulse" : "w-0 opacity-0"
        )}
      />
    </header>
  );
}
