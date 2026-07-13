import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { descargarCSV } from "@/lib/csvExport";

interface ExportarCSVButtonProps {
  nombreArchivo: string;
  filas: Record<string, unknown>[];
}

/**
 * Botón "Exportar CSV" reutilizado por los 10 reportes — cada página
 * solo pasa sus filas ya cargadas (mapeadas a un objeto plano). Se
 * deshabilita solo si de verdad no hay nada que exportar.
 */
export function ExportarCSVButton({ nombreArchivo, filas }: ExportarCSVButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={filas.length === 0}
      onClick={() => descargarCSV(nombreArchivo, filas)}
    >
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
