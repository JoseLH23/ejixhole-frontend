import { NavLink, useNavigate } from "react-router-dom";
import { X, Command, ChevronDown, LogOut, Circle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS, type NavItem } from "@/router/navigation";
import { cn } from "@/lib/utils";
import { etiquetaAtajoBuscar } from "@/lib/platform";
import { nombreVisible } from "@/lib/nombreUsuario";
import { useEstadoSistemas } from "@/hooks/useEstadoSistema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Logo real de EjiXhole, ya publicado y verificado en producción
// (ejixhole-reservas.vercel.app/logo.png — el mismo que usa el correo
// HTML de notificaciones y el propio sitio público). Reemplaza el
// ícono genérico de Lucide que había antes.
const LOGO_URL = "https://ejixhole-reservas.vercel.app/logo.png?v=3";

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

function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

/**
 * Navegación agrupada + bloque de usuario/logout al final.
 *
 * La tarjeta de foto decorativa que había aquí (`/park/canoa.jpg`) se
 * quitó: la imagen no cargaba en producción (el archivo no existe
 * realmente desplegado, solo en la documentación de una entrega
 * anterior) y, aun si cargara, era exactamente el tipo de componente
 * grande-con-poco-contenido que se pidió eliminar. En su lugar, ese
 * espacio ahora muestra el estado real de los 3 sistemas — información
 * de verdad, no decoración.
 */
export function Sidebar({ abiertoEnMobile, onCerrar, onAbrirPaleta }: SidebarProps) {
  const { usuario, logout } = useAuth();
  const { sistemas } = useEstadoSistemas();
  const navigate = useNavigate();

  const gruposVisibles = ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    items: NAV_ITEMS.filter((item) => item.grupo === grupo && usuario && item.roles.includes(usuario.rol)),
  })).filter((g) => g.items.length > 0);

  const nombre = usuario ? nombreVisible(usuario.email) : "";
  const sistemasCaidos = sistemas.filter((s) => s.estado !== "en_linea").length;

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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-48 flex-col border-r border-border bg-card transition-transform duration-200 ease-out md:static md:translate-x-0",
          abiertoEnMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <img
              src={LOGO_URL}
              alt="EjiXhole"
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
            <span className="font-display text-sm font-semibold">EjiXhole</span>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Disparador de la paleta de comandos — Ctrl+K real en Windows */}
        <div className="p-2.5">
          <button
            onClick={onAbrirPaleta}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-1.5">
              <Command className="h-3.5 w-3.5" />
              Buscar...
            </span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">
              {etiquetaAtajoBuscar()}
            </kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-3.5 overflow-y-auto px-2 pb-2">
          {gruposVisibles.map(({ grupo, items }) => (
            <div key={grupo}>
              <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                          "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                        )
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Estado real de los 3 sistemas — reemplaza la tarjeta decorativa */}
        <div className="border-t border-border px-3 py-2.5">
          <p className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            <span>Estado del sistema</span>
            {sistemasCaidos > 0 && <span className="text-destructive">{sistemasCaidos} con problemas</span>}
          </p>
          <div className="space-y-1">
            {sistemas.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-[11px]">
                <span className="truncate text-muted-foreground">{s.nombre}</span>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 font-medium",
                    s.estado === "en_linea" && "text-success",
                    s.estado === "degradado" && "text-warning",
                    s.estado === "sin_conexion" && "text-destructive"
                  )}
                >
                  <Circle className="h-1.5 w-1.5 fill-current" />
                  {s.estado === "en_linea" ? "En línea" : s.estado === "degradado" ? "Degradado" : "Sin conexión"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Usuario + rol + logout */}
        {usuario && (
          <div className="border-t border-border p-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-accent">
                <Avatar className="h-7 w-7 ring-2 ring-primary/10">
                  <AvatarFallback className="text-[11px]">{inicialesDe(nombre)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{nombre}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {ROL_LABELS[usuario.rol] ?? usuario.rol}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-normal">{nombre}</p>
                  <p className="text-xs font-normal text-muted-foreground">{usuario.email}</p>
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
