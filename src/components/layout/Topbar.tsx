import { useNavigate } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { LogOut, ChevronDown, Menu } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
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
}

export function Topbar({ onAbrirMenu }: TopbarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Indicador global y sutil de que hay datos cargándose en segundo
  // plano (cualquier useQuery activo) — evita que un refetch silencioso
  // se sienta como que "no pasó nada" cuando en realidad sí hay
  // actividad de red.
  const numeroDeFetchesActivos = useIsFetching();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <button
        onClick={onAbrirMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" />

      {usuario && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{inicialesDe(usuario.email)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="font-medium leading-tight">{usuario.email}</p>
              <p className="text-xs leading-tight text-muted-foreground">
                {ROL_LABELS[usuario.rol] ?? usuario.rol}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-normal text-muted-foreground">{usuario.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Barra de carga global: sutil, solo aparece cuando hay fetches activos */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-primary transition-opacity duration-300",
          numeroDeFetchesActivos > 0 ? "w-full opacity-100 animate-pulse" : "w-0 opacity-0"
        )}
      />
    </header>
  );
}
