/** Tipos que reflejan app/schemas/reservacion.py y app/models/reservacion.py del backend. */

export const ESTADOS_RESERVACION = ["pendiente", "confirmada", "en_curso", "completada", "cancelada"] as const;
export type EstadoReservacion = (typeof ESTADOS_RESERVACION)[number];

export const ORIGENES_RESERVACION = ["recepcion", "recepcion_express", "portal", "telefono"] as const;
export type OrigenReservacion = (typeof ORIGENES_RESERVACION)[number];

export const TIPOS_RESERVACION = ["entrada", "camping", "hospedaje"] as const;
export type TipoReservacion = (typeof TIPOS_RESERVACION)[number];

export interface Reservacion {
  id: number;
  cliente_id: number;
  servicio_id: number;
  usuario_id: number | null;
  fecha_reservacion: string;
  fecha_visita: string;
  tipo_reservacion: TipoReservacion;
  fecha_llegada: string | null;
  fecha_salida: string | null;
  unidad_hospedaje_id: number | null;
  num_personas: number;
  estado: EstadoReservacion;
  origen: OrigenReservacion;
  total: string;
  monto_pagado: string;
  saldo_pendiente: string;
  pago_completo: boolean;
  fecha_checkin: string | null;
  checkin_usuario_id: number | null;
  fecha_checkout: string | null;
  checkout_usuario_id: number | null;
  notas: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ReservacionCreateInput {
  cliente_id: number;
  servicio_id: number;
  tipo_reservacion: TipoReservacion;
  fecha_llegada: string;
  fecha_salida: string;
  unidad_hospedaje_id?: number;
  num_personas: number;
  origen: OrigenReservacion;
  notas?: string;
}

export interface ReservacionUpdateInput {
  servicio_id?: number;
  fecha_llegada?: string;
  fecha_salida?: string;
  num_personas?: number;
  unidad_hospedaje_id?: number;
  notas?: string;
}

export interface ReservacionEstadoUpdateInput {
  nuevo_estado: EstadoReservacion;
}
