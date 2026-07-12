import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  icon?: LucideIcon;
  accion?: ReactNode;
}

/**
 * CORRECCIÓN: antes usaba `h-[40vh]` — una altura fija relativa al
 * viewport (~360px en una pantalla típica) sin importar dónde se
 * usara. Eso se veía razonable en una página completa (Clientes,
 * Servicios...) pero era un componente ENORME con casi nada de
 * contenido cuando se anidaba dentro de una tarjeta angosta del
 * Dashboard (Actividad reciente, Próximas reservaciones) — exactamente
 * el problema de "componentes gigantes con poco contenido" reportado.
 *
 * Ahora el tamaño lo define el propio contenido (ícono + texto +
 * padding), no el viewport — se ve bien tanto de página completa como
 * anidado en una tarjeta pequeña, sin necesitar una prop nueva ni
 * tocar los 20+ lugares donde ya se usa.
 */
export function EmptyState({ titulo, descripcion, icon: Icon = Inbox, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <h3 className="text-sm font-medium">{titulo}</h3>
      {descripcion && <p className="max-w-sm text-xs text-muted-foreground">{descripcion}</p>}
      {accion}
    </div>
  );
}
