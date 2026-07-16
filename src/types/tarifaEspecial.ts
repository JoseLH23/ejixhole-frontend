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
