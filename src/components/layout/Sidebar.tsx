import * as React from "react";
import { NavLink } from "react-router-dom";
import { Waves, X, Command } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, type NavItem } from "@/router/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  abiertoEnMobile: boolean;
  onCerrar: () => void;
  onAbrirPaleta: () => void;
}

const ORDEN_GRUPOS: NavItem["grupo"][] = ["Principal", "Operación", "Análisis", "Administración"];

/**
 * Rediseño total (Entrega 6): navegación agrupada por sección
 * (Principal / Operación / Análisis / Administración) con etiquetas
 * discretas en mayúsculas — el lenguaje visual de Linear/Notion, en
 * vez de una lista plana de 8 links iguales.
 */
export function Sidebar({ abiertoEnMobile, onCerrar, onAbrirPaleta }: SidebarProps) {
  const { usuario } = useAuth();

  const gruposVisibles = ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    items: NAV_ITEMS.filter((item) => item.grupo === grupo && usuario && item.roles.includes(usuario.rol)),
  })).filter((g) => g.items.length > 0);

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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-out md:static md:translate-x-0",
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
      </aside>
    </>
  );
}
