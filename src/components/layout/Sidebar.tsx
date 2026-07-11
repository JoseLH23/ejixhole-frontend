import { NavLink, useNavigate } from "react-router-dom";
import { Waves, X, Command, ChevronDown, LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, type NavItem } from "@/router/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  abiertoEnMobile: boolean;
  onCerrar: () => void;
  onAbrirPaleta: () => void;
}

const ORDEN_GRUPOS: NavItem["grupo"][] = ["Principal", "Operación", "Análisis", "Administración"];

const ROL_LABELS: Record<string, string> = {
  admin: "Administrador",
  operador: "Operador",
  cajero: "Cajero",
};

function inicialesDe(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

/**
 * Navegación agrupada (Entrega 6) + tarjeta de foto/usuario al final
 * (pedido explícito tras la Entrega 8, siguiendo la referencia
 * visual). El bloque de usuario/logout se movió aquí desde el Topbar
 * a propósito — antes vivía en los dos lugares habría sido
 * duplicado; ahora solo existe aquí.
 *
 * Nota: la tarjeta de foto es puramente decorativa (misma fotografía
 * real de `public/park/`, no representa ningún dato) — mismo criterio
 * de honestidad que el resto del Dashboard.
 */
export function Sidebar({ abiertoEnMobile, onCerrar, onAbrirPaleta }: SidebarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const gruposVisibles = ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    items: NAV_ITEMS.filter((item) => item.grupo === grupo && usuario && item.roles.includes(usuario.rol)),
  })).filter((g) => g.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {abiertoEnMobile && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] transition-opacity md:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-56 flex-col border-r border-border bg-card transition-transform duration-200 ease-out md:static md:translate-x-0",
          abiertoEnMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">EjiXhole</span>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Disparador de la paleta de comandos — se ve como un input pero abre ⌘K */}
        <div className="p-3">
          <button
            onClick={onAbrirPaleta}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              <Command className="h-3.5 w-3.5" />
              Buscar...
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
          {gruposVisibles.map(({ grupo, items }) => (
            <div key={grupo}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {grupo}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={onCerrar}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Tarjeta decorativa — fotografía real, sin ningún dato detrás */}
        <div className="px-3 pb-3">
          <div className="relative h-28 overflow-hidden rounded-xl">
            <img
              src="/park/canoa.jpg"
              alt="Recorrido en canoa en EjiXhole"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
            <p className="absolute bottom-2 left-3 right-3 font-display text-xs font-medium leading-snug text-white">
              Naturaleza que inspira, experiencias que permanecen.
            </p>
          </div>
        </div>

        {/* Usuario + rol + logout — único lugar donde aparece (antes vivía en el Topbar) */}
        {usuario && (
          <div className="border-t border-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg p-2 text-left outline-none transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                  <AvatarFallback className="text-xs">{inicialesDe(usuario.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{usuario.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ROL_LABELS[usuario.rol] ?? usuario.rol}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
          </div>
        )}
      </aside>
    </>
  );
}
