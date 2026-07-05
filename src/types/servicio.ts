/** Tipos que reflejan app/schemas/servicio.py del backend. */

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string; // Decimal serializado como string (ej. "500.00")
  duracion_minutos: number | null;
  capacidad_maxima: number | null;
  categoria: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ServicioCreateInput {
  nombre: string;
  descripcion?: string;
  /** String decimal (ej. "350.00") — el backend lo parsea a Decimal preservando los dígitos exactos. */
  precio: string;
  duracion_minutos?: number;
  capacidad_maxima?: number;
  categoria?: string;
}

export type ServicioUpdateInput = Partial<ServicioCreateInput>;
