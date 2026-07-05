import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LogOut, ChevronDown, Menu, Search, Circle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useReloj } from "@/hooks/useReloj";
import { useEstadoSistema } from "@/hooks/useEstadoSistema";
import { NAV_ITEMS } from "@/router/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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

function saludoSegunHora(hora: number): string {
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

interface TopbarProps {
  onAbrirMenu: () => void;
}

export function Topbar({ onAbrirMenu }: TopbarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const ahora = useReloj();
  const { enLinea } = useEstadoSistema();

  const [busqueda, setBusqueda] = React.useState("");
  const [busquedaAbierta, setBusquedaAbierta] = React.useState(false);

  // Indicador global y sutil de que hay datos cargándose en segundo
  // plano (cualquier useQuery activo).
  const numeroDeFetchesActivos = useIsFetching();

  const itemsBusqueda = React.useMemo(() => {
    if (!usuario || !busqueda.trim()) return [];
    const texto = busqueda.trim().toLowerCase();
    return NAV_ITEMS.filter(
      (item) => item.roles.includes(usuario.rol) && item.label.toLowerCase().includes(texto)
    );
  }, [busqueda, usuario]);

  const irA = (path: string) => {
    navigate(path);
    setBusqueda("");
    setBusquedaAbierta(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <button
        onClick={onAbrirMenu}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Saludo + hora — solo desktop, para no saturar mobile */}
      {usuario && (
        <div className="hidden lg:block">
          <p className="text-sm font-medium leading-tight">
            {saludoSegunHora(ahora.getHours())}, {usuario.email.split("@")[0]}
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            {format(ahora, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </p>
        </div>
      )}

      {/* Búsqueda rápida — navega entre secciones del menú (client-side,
          no simula una búsqueda del backend que no existe). */}
      <div className="relative ml-2 max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar en el menú..."
          className="h-9 border-none bg-muted/50 pl-9 shadow-none focus-visible:bg-background"
          value={busqueda}
          onFocus={() => setBusquedaAbierta(true)}
          onBlur={() => setTimeout(() => setBusquedaAbierta(false), 150)}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && itemsBusqueda[0]) irA(itemsBusqueda[0].path);
          }}
        />
        {busquedaAbierta && itemsBusqueda.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-premium-lg">
            {itemsBusqueda.map((item) => (
              <button
                key={item.path}
                onClick={() => irA(item.path)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Estado del sistema — real, contra GET /status */}
      <div className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:flex">
        <Circle
          className={cn(
            "h-2 w-2 fill-current",
            enLinea ? "text-success" : "text-destructive"
          )}
        />
        {enLinea ? "Sistema en línea" : "Sin conexión"}
      </div>

      {usuario && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent">
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
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
          "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-opacity duration-300",
          numeroDeFetchesActivos > 0 ? "w-full opacity-100 animate-pulse" : "w-0 opacity-0"
        )}
      />
    </header>
  );
}
