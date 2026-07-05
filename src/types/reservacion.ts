/** Tipos que reflejan app/schemas/reservacion.py y app/models/reservacion.py del backend. */

export const ESTADOS_RESERVACION = ["pendiente", "confirmada", "completada", "cancelada"] as const;
export type EstadoReservacion = (typeof ESTADOS_RESERVACION)[number];

export const ORIGENES_RESERVACION = ["recepcion", "recepcion_express", "portal", "telefono"] as const;
export type OrigenReservacion = (typeof ORIGENES_RESERVACION)[number];

export interface Reservacion {
  id: number;
  cliente_id: number;
  servicio_id: number;
  usuario_id: number;
  fecha_reservacion: string;
  fecha_visita: string; // date, ej. "2026-08-15"
  num_personas: number;
  estado: EstadoReservacion;
  origen: OrigenReservacion;
  total: string; // Decimal serializado como string
  monto_pagado: string;
  saldo_pendiente: string;
  notas: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ReservacionCreateInput {
  cliente_id: number;
  servicio_id: number;
  /**
   * Temporal: el backend todavía no toma esto del JWT (ver
   * app/schemas/reservacion.py del backend) — hay que mandarlo
   * explícito. Ver docs/entrega-3c.md para cómo se resuelve en la UI.
   */
  usuario_id: number;
  fecha_visita: string;
  num_personas: number;
  origen: OrigenReservacion;
  notas?: string;
}

export interface ReservacionEstadoUpdateInput {
  nuevo_estado: EstadoReservacion;
}
