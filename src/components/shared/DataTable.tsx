import * as React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DataTableColumn<T> {
  header: string;
  /** Renderiza el contenido de la celda para una fila dada. */
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Identifica cada fila para la key de React — normalmente `(row) => row.id`. */
  getRowId: (row: T) => string | number;
  /** Acciones por fila (editar/desactivar/etc.), renderizadas en la última columna. */
  renderAcciones?: (row: T) => React.ReactNode;
}

/**
 * Tabla genérica reutilizada por Clientes y (en próximas entregas)
 * Reservaciones/Servicios/Pagos/Caja — ningún CRUD escribe su propia
 * tabla desde cero, solo define columnas y acciones.
 */
export function DataTable<T>({ columns, data, getRowId, renderAcciones }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.header} className={col.className}>
              {col.header}
            </TableHead>
          ))}
          {renderAcciones && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={getRowId(row)}>
            {columns.map((col) => (
              <TableCell key={col.header} className={col.className}>
                {col.cell(row)}
              </TableCell>
            ))}
            {renderAcciones && <TableCell className="text-right">{renderAcciones(row)}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
