import type { Rol } from "@/types/auth";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Package,
  Wallet,
  Landmark,
  BarChart3,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Roles permitidos — mismo mapeo exacto que docs/modulos/permisos-por-rol.md */
  roles: Rol[];
  /** Sección visual del Sidebar (Entrega 6) — puramente de presentación, no afecta permisos ni rutas. */
  grupo: "Principal" | "Operación" | "Análisis" | "Administración";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "operador", "cajero"], grupo: "Principal" },
  { label: "Calendario", path: "/calendario", icon: CalendarDays, roles: ["admin"], grupo: "Principal" },
  { label: "Clientes", path: "/clientes", icon: Users, roles: ["admin", "operador"], grupo: "Operación" },
  { label: "Reservaciones", path: "/reservaciones", icon: CalendarCheck, roles: ["admin", "operador"], grupo: "Operación" },
  { label: "Servicios", path: "/servicios", icon: Package, roles: ["admin"], grupo: "Operación" },
  { label: "Pagos", path: "/pagos", icon: Wallet, roles: ["admin", "cajero"], grupo: "Operación" },
  { label: "Caja", path: "/caja", icon: Landmark, roles: ["admin", "operador", "cajero"], grupo: "Operación" },
  { label: "Reportes", path: "/reportes", icon: BarChart3, roles: ["admin"], grupo: "Análisis" },
  { label: "Usuarios", path: "/usuarios", icon: UserCog, roles: ["admin"], grupo: "Administración" },
];
