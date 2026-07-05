/** Tipos que reflejan app/schemas/caja.py y app/models/caja.py del backend. */

export const ESTADOS_CAJA = ["abierta", "cerrada"] as const;
export type EstadoCaja = (typeof ESTADOS_CAJA)[number];

export const TIPOS_MOVIMIENTO = ["ingreso", "egreso"] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export interface CajaSesion {
  id: number;
  usuario_id: number;
  fecha_apertura: string;
  monto_apertura: string;
  fecha_cierre: string | null;
  monto_cierre_esperado: string | null;
  monto_cierre_real: string | null;
  diferencia: string | null;
  estado: EstadoCaja;
  saldo_actual: string;
  notas: string | null;
}

/** CajaMovimientoOut NO incluye usuario_id (aunque el modelo sí lo tiene) — confirmado en app/schemas/caja.py. */
export interface CajaMovimiento {
  id: number;
  caja_sesion_id: number;
  tipo: TipoMovimiento;
  monto: string;
  concepto: string;
  fecha: string;
}

export interface CajaAbrirInput {
  /** Temporal, misma limitación que en Reservaciones/Pagos — ver docs/entrega-3e.md. */
  usuario_id: number;
  monto_apertura: string;
}

export interface CajaCerrarInput {
  monto_cierre_real: string;
}

export interface CajaMovimientoCreateInput {
  usuario_id: number;
  tipo: TipoMovimiento;
  monto: string;
  concepto: string;
}
