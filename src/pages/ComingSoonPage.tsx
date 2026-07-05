import { Construction } from "lucide-react";

/**
 * Placeholder para cualquier módulo cuya infraestructura de rutas ya
 * existe pero cuyo CRUD real todavía no se implementa (Entrega 1 es
 * solo infraestructura — ver docs/frontend/entrega-1.md).
 */
export function ComingSoonPage({ titulo }: { titulo: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Construction className="h-10 w-10 text-muted-foreground" />
      <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esta sección todavía no está implementada. La navegación y los permisos ya
        funcionan — el contenido llega en una próxima entrega.
      </p>
    </div>
  );
}
