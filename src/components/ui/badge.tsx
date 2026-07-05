import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ESTADOS_CON_COLOR = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
  "activo",
  "inactivo",
  "abierta",
  "cerrada",
] as const;

type EstadoConColor = (typeof ESTADOS_CON_COLOR)[number];

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        // Estados reales de los 8 módulos — mismo vocabulario que el
        // backend (Reservaciones/Pagos, Clientes/Servicios, Caja).
        pendiente: "border-transparent bg-estado-pendiente/15 text-estado-pendiente",
        confirmada: "border-transparent bg-estado-confirmada/15 text-estado-confirmada",
        completada: "border-transparent bg-estado-completada/15 text-estado-completada",
        cancelada: "border-transparent bg-estado-cancelada/15 text-estado-cancelada",
        activo: "border-transparent bg-estado-activo/15 text-estado-activo",
        inactivo: "border-transparent bg-estado-inactivo/15 text-estado-inactivo",
        abierta: "border-transparent bg-estado-abierta/15 text-estado-abierta",
        cerrada: "border-transparent bg-estado-cerrada/15 text-estado-cerrada",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Punto de color antes del texto — detalle premium, opcional. */
  dot?: boolean;
}

const DOT_COLOR_CLASS: Partial<Record<string, string>> = {
  pendiente: "bg-estado-pendiente",
  confirmada: "bg-estado-confirmada",
  completada: "bg-estado-completada",
  cancelada: "bg-estado-cancelada",
  activo: "bg-estado-activo",
  inactivo: "bg-estado-inactivo",
  abierta: "bg-estado-abierta",
  cerrada: "bg-estado-cerrada",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", DOT_COLOR_CLASS[variant ?? "default"] ?? "bg-current")}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Mapea CUALQUIER estado real del sistema a su Badge con color
 * consistente — un solo lugar decide el color, usado en los 8
 * módulos: Reservaciones/Pagos (pendiente/confirmada/completada/
 * cancelada), Clientes/Servicios (activo/inactivo), Caja
 * (abierta/cerrada).
 */
function EstadoBadge({ estado }: { estado: string }) {
  const variant = (ESTADOS_CON_COLOR as readonly string[]).includes(estado)
    ? (estado as EstadoConColor)
    : "outline";

  return (
    <Badge variant={variant} dot>
      {estado}
    </Badge>
  );
}

export { Badge, badgeVariants, EstadoBadge };
