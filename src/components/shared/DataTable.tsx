import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  /**
   * Filas por página (fase "pulido visual" — antes no existía
   * paginación, se listaba todo). 12 es el punto medio del rango
   * pedido (10–15) para la mayoría de pantallas sin sentirse ni
   * vacío ni apretado.
   */
  pageSize?: number;
}

/**
 * Tabla genérica reutilizada por Clientes, Servicios, Reservaciones,
 * Pagos y Caja — ningún CRUD escribe su propia tabla desde cero, solo
 * define columnas y acciones.
 *
 * Fase "pulido visual": ahora incluye paginación del lado del
 * cliente (todas las páginas ya cargan la lista completa en memoria,
 * ver docs/entrega-3a.md, así que paginar aquí no requiere tocar
 * ningún hook de datos) y una vista de tarjetas automática en móvil
 * — se genera a partir de las mismas `columns`, así ningún módulo
 * necesita mantener una versión de tarjeta duplicada por separado
 * (la que se agregó a mano en Reservaciones se retira a favor de
 * esta versión genérica).
 */
export function DataTable<T>({ columns, data, getRowId, renderAcciones, pageSize = 10 }: DataTableProps<T>) {
  const [pagina, setPagina] = React.useState(1);

  // Si cambian los filtros (nueva referencia de `data`) o la lista se
  // acorta por debajo de la página actual, vuelve a la página 1 en
  // vez de mostrar una página vacía.
  React.useEffect(() => {
    setPagina(1);
  }, [data]);

  const totalPaginas = Math.max(1, Math.ceil(data.length / pageSize));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * pageSize;
  const datosPagina = data.slice(inicio, inicio + pageSize);

  return (
    <div className="space-y-3">
      {/* Escritorio/tablet: tabla completa. */}
      <div className="hidden md:block">
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
            {datosPagina.map((row) => (
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
      </div>

      {/* Móvil: tarjetas apiladas — la primera columna actúa como título
          (por convención cada módulo ya pone el dato más identificable
          primero: nombre, folio, etc.), el resto se muestra como
          pares etiqueta/valor. Nada de scroll horizontal ni zoom. */}
      <div className="grid gap-2.5 md:hidden">
        {datosPagina.map((row) => (
          <Card key={getRowId(row)} className="p-3.5">
            <div className="text-base font-semibold leading-snug">{columns[0]?.cell(row)}</div>
            {columns.length > 1 && (
              <div className="mt-2 space-y-1.5">
                {columns.slice(1).map((col) => (
                  <div key={col.header} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{col.header}</span>
                    <span className="text-right">{col.cell(row)}</span>
                  </div>
                ))}
              </div>
            )}
            {renderAcciones && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{renderAcciones(row)}</div>
            )}
          </Card>
        ))}
      </div>

      {/* Paginación — comparte estado entre tabla y tarjetas (misma
          porción de datos). Solo se muestra si hay más de una página. */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
          <span>
            {inicio + 1}–{Math.min(inicio + pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaSegura <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4.5rem] text-center text-xs">
              Página {paginaSegura} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura >= totalPaginas}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
