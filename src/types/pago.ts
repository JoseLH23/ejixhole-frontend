/** Tipos que reflejan app/schemas/pago.py y app/models/pago.py del backend. */

export const TIPOS_PAGO = ["anticipo", "pago_completo", "pago_saldo", "reembolso"] as const;
export type TipoPago = (typeof TIPOS_PAGO)[number];

export const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia", "otro"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface Pago {
  id: number;
  reservacion_id: number;
  usuario_id: number;
  monto: string; // Decimal serializado como string
  tipo: TipoPago;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  fecha_pago: string;
}

export interface PagoCreateInput {
  reservacion_id: number;
  /** Temporal, misma limitación que en Reservaciones — ver docs/entrega-3d.md. */
  usuario_id: number;
  monto: string;
  tipo: TipoPago;
  metodo_pago: MetodoPago;
  referencia?: string;
  notas?: string;
}
