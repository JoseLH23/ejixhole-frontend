import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        // Estados de reservación/pago — mismo vocabulario que el backend
        pendiente: "border-transparent bg-estado-pendiente/15 text-estado-pendiente",
        confirmada: "border-transparent bg-estado-confirmada/15 text-estado-confirmada",
        completada: "border-transparent bg-estado-completada/15 text-estado-completada",
        cancelada: "border-transparent bg-estado-cancelada/15 text-estado-cancelada",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Mapea directamente un `estado` de reservación/pago del backend
 * (pendiente | confirmada | completada | cancelada) a su Badge — un
 * solo lugar del sistema decide el color de cada estado.
 */
function EstadoBadge({ estado }: { estado: string }) {
  const variant = (["pendiente", "confirmada", "completada", "cancelada"] as const).includes(
    estado as any
  )
    ? (estado as "pendiente" | "confirmada" | "completada" | "cancelada")
    : "outline";

  return <Badge variant={variant}>{estado}</Badge>;
}

export { Badge, badgeVariants, EstadoBadge };
