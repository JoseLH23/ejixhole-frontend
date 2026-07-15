export type TipoEventoCalendario = "bloqueo" | "mantenimiento" | "recordatorio" | "campana";

export interface EventoCalendario {
  id: number;
  titulo: string;
  tipo: TipoEventoCalendario;
  fecha_inicio: string;
  fecha_fin: string;
  notas?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EventoCalendarioCreateInput {
  titulo: string;
  tipo: TipoEventoCalendario;
  fecha_inicio: string;
  fecha_fin: string;
  notas?: string | null;
}
