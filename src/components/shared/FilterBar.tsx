import type { ReactNode } from "react";

/**
 * Envoltorio puramente visual para barras de filtros — no cambia
 * ningún filtro existente, solo les da un contenedor consistente
 * (antes: Selects/Inputs sueltos en el espacio en blanco). Se usa en
 * Clientes, Servicios, Reservaciones, Pagos y Caja.
 */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-sm">
      {children}
    </div>
  );
}
