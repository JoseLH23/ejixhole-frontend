import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Rediseño de densidad (fase "pulido visual"): filas más bajas, menos
 * padding, encabezado pegajoso (sticky) para tablas largas dentro de
 * un contenedor con `max-height` — usado por DataTable, que ahora
 * pagina, así que el sticky header rara vez se ve con más de 12 filas,
 * pero se deja listo para cualquier tabla que crezca.
 */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl border border-border shadow-premium">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("sticky top-0 z-10 bg-muted/95 backdrop-blur-sm [&_tr]:border-b", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    // Filas alternadas (zebra) — sutil, solo un tono de diferencia.
    className={cn("[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-muted/25", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors duration-150 hover:bg-primary/5",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Compactado: h-12→h-9, tracking un poco menor para que quepa más.
      "h-8 px-2.5 text-left align-middle text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  // Compactado: py-3.5→py-2, px-4→px-3 — menos altura por fila, misma legibilidad.
  <td ref={ref} className={cn("px-2.5 py-1.5 align-middle text-[13px]", className)} {...props} />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
