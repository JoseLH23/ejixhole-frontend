import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Acento = "primary" | "secondary" | "wood";

const ACENTO_CLASES: Record<Acento, { chip: string; icon: string }> = {
  primary: { chip: "bg-primary/12", icon: "text-primary" },
  secondary: { chip: "bg-secondary/12", icon: "text-secondary" },
  wood: { chip: "bg-wood/15", icon: "text-wood" },
};

interface PageHeaderProps {
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  /** Color de marca asociado al módulo (selva/agua/madera) — un solo lugar decide la identidad visual de cada sección. */
  acento?: Acento;
  /**
   * Foto real opcional (URL pública verificada — logo/galería ya
   * publicados en ejixhole-reservas.vercel.app). Se omite en módulos
   * sin una foto temática honesta (Pagos, Caja) en vez de forzar una
   * imagen que no represente el contenido.
   */
  fotoUrl?: string;
  fotoAlt?: string;
  acciones?: ReactNode;
}

/**
 * Encabezado compartido por los 5 módulos con listado (Clientes,
 * Reservaciones, Servicios, Pagos, Caja) — reemplaza el bloque de
 * `<h1>` + `<p>` que cada página repetía por separado. Un solo lugar
 * decide cómo se ve la identidad visual de un módulo (color de acento
 * + ícono + foto opcional), así que agregar/ajustar esa identidad no
 * requiere tocar cada página una por una.
 */
export function PageHeader({ titulo, descripcion, icon: Icon, acento = "primary", fotoUrl, fotoAlt, acciones }: PageHeaderProps) {
  const clases = ACENTO_CLASES[acento];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-premium sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={fotoAlt ?? ""}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", clases.chip)}>
            <Icon className={cn("h-5 w-5", clases.icon)} />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight">{titulo}</h1>
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        </div>
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </div>
  );
}
