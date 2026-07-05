import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  icon?: LucideIcon;
  accion?: ReactNode;
}

export function EmptyState({ titulo, descripcion, icon: Icon = Inbox, accion }: EmptyStateProps) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <h3 className="font-medium">{titulo}</h3>
      {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
      {accion}
    </div>
  );
}
