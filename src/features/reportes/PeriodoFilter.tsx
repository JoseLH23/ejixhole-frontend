import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Periodo } from "@/types/reporte";

const FILTRO_PERSONALIZADO = "personalizado";

const PERIODO_LABELS: Record<Periodo, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  anio: "Este año",
};

export interface PeriodoFiltroValue {
  periodo?: Periodo;
  desde?: string;
  hasta?: string;
}

interface PeriodoFilterProps {
  value: PeriodoFiltroValue;
  onChange: (value: PeriodoFiltroValue) => void;
}

/**
 * Filtro de fecha reutilizado por los 7 reportes que soportan
 * periodo/desde/hasta (todos menos cuentas-por-cobrar y
 * próximas-reservaciones, que no filtran por fecha en el backend).
 * "Personalizado" limpia `periodo` y expone los inputs de fecha — si
 * ninguno de los dos se toca, el backend usa su propio default (mes
 * actual).
 */
export function PeriodoFilter({ value, onChange }: PeriodoFilterProps) {
  const modo = value.periodo ?? FILTRO_PERSONALIZADO;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Periodo</label>
        <Select
          value={modo}
          onValueChange={(nuevo) =>
            onChange(
              nuevo === FILTRO_PERSONALIZADO
                ? { periodo: undefined, desde: value.desde, hasta: value.hasta }
                : { periodo: nuevo as Periodo, desde: undefined, hasta: undefined }
            )
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PERIODO_LABELS) as Periodo[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PERIODO_LABELS[p]}
              </SelectItem>
            ))}
            <SelectItem value={FILTRO_PERSONALIZADO}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {modo === FILTRO_PERSONALIZADO && (
        <>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input
              type="date"
              className="w-40"
              value={value.desde ?? ""}
              onChange={(e) => onChange({ ...value, periodo: undefined, desde: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input
              type="date"
              className="w-40"
              value={value.hasta ?? ""}
              onChange={(e) => onChange({ ...value, periodo: undefined, hasta: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}
