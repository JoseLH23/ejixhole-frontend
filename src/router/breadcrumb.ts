import { NAV_ITEMS, type NavItem } from "./navigation";

/**
 * Encuentra el item de navegación cuya ruta coincide mejor con la
 * ruta actual (soporta sub-rutas, ej. /reportes/ingresos → "Reportes").
 * Usado por el Topbar minimalista (Entrega 6) para mostrar contexto de
 * sección sin duplicar el <h1> que cada página ya renderiza.
 */
export function encontrarSeccionActual(pathname: string): NavItem | undefined {
  const candidatos = NAV_ITEMS.filter((item) =>
    item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
  );
  return candidatos.sort((a, b) => b.path.length - a.path.length)[0];
}
