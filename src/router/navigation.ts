import type { Rol } from "@/types/auth";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
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
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "operador", "cajero"] },
  { label: "Clientes", path: "/clientes", icon: Users, roles: ["admin", "operador"] },
  { label: "Reservaciones", path: "/reservaciones", icon: CalendarCheck, roles: ["admin", "operador"] },
  { label: "Servicios", path: "/servicios", icon: Package, roles: ["admin"] },
  { label: "Pagos", path: "/pagos", icon: Wallet, roles: ["admin", "cajero"] },
  { label: "Caja", path: "/caja", icon: Landmark, roles: ["admin", "operador", "cajero"] },
  { label: "Reportes", path: "/reportes", icon: BarChart3, roles: ["admin"] },
  { label: "Usuarios", path: "/usuarios", icon: UserCog, roles: ["admin"] },
];
