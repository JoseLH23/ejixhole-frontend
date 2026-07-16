export type AplicaTarifa = "todos" | "entrada" | "camping" | "hospedaje";

export interface TarifaEspecial {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  porcentaje_ajuste: string;
  aplica_a: AplicaTarifa;
  dias_semana: number[] | null;
  prioridad: number;
  unidad_hospedaje_id: number | null;
  activa: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface TarifaEspecialInput {
  nombre: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  porcentaje_ajuste: number;
  aplica_a: AplicaTarifa;
  dias_semana?: number[] | null;
  prioridad: number;
  unidad_hospedaje_id?: number | null;
  activa: boolean;
}

export interface SimulacionTarifaInput {
  servicio_id: number;
  tipo_reservacion: Exclude<AplicaTarifa, "todos">;
  fecha_llegada: string;
  fecha_salida: string;
  num_personas: number;
  unidad_hospedaje_id?: number | null;
  candidata: TarifaEspecialInput;
}

export interface SimulacionTarifaResultado {
  total_base: string;
  total_actual: string;
  total_con_candidata: string;
  diferencia: string;
  regla_ganadora: string | null;
  desglose: Array<{ concepto: string; detalle: string; subtotal: string }>;
  conflictos: string[];
}
