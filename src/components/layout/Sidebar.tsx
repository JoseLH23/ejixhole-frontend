import { NavLink } from "react-router-dom";
import { Waves, X } from "lucide-react";

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
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0",
          abiertoEnMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-semibold">EjiXhole</span>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          EjiXhole Experience OS
        </div>
      </aside>
    </>
  );
}
