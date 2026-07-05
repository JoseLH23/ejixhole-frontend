import { NavLink } from "react-router-dom";
import { Waves, X, Leaf } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/router/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  /** Controla visibilidad SOLO en mobile (< md) — en desktop siempre está visible. */
  abiertoEnMobile: boolean;
  onCerrar: () => void;
}

export function Sidebar({ abiertoEnMobile, onCerrar }: SidebarProps) {
  const { usuario } = useAuth();

  const itemsVisibles = NAV_ITEMS.filter(
    (item) => usuario && item.roles.includes(usuario.rol)
  );

  return (
    <>
      {/* Overlay oscuro detrás del sidebar en mobile, cierra al tocar fuera */}
      {abiertoEnMobile && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] transition-opacity md:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-out md:static md:translate-x-0",
          abiertoEnMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo — insignia con degradado verde selva → turquesa agua,
            la firma visual de marca en el punto más prominente de la app. */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-premium">
              <Waves className="h-5 w-5" />
              <Leaf className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-wood p-0.5 text-wood-foreground shadow-sm" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">EjiXhole</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Experience OS
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {itemsVisibles.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onCerrar}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-premium"
                      : "text-foreground/75 hover:translate-x-0.5 hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110"
                  )}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 border-t border-border p-4 text-xs text-muted-foreground">
          <Leaf className="h-3.5 w-3.5 text-primary/70" />
          EjiXhole Experience OS
        </div>
      </aside>
    </>
  );
}
