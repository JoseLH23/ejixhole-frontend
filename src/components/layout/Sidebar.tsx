import { NavLink } from "react-router-dom";
import { Waves } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/router/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { usuario } = useAuth();

  const itemsVisibles = NAV_ITEMS.filter(
    (item) => usuario && item.roles.includes(usuario.rol)
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Waves className="h-4 w-4" />
        </div>
        <span className="font-display text-lg font-semibold">EjiXhole</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {itemsVisibles.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
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
  );
}
