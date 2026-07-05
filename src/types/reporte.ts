/** Tipos que reflejan app/schemas/reporte.py del backend, exactos. */

export type Periodo = "hoy" | "semana" | "mes" | "anio";
export type AgruparPorFecha = "dia" | "semana" | "mes";
export type AgruparPorIngresos = AgruparPorFecha | "metodo_pago";

// --- Ingresos ---------------------------------------------------

export interface SerieIngresoItem {
  periodo: string;
  ingresos: string;
  reembolsos: string;
  neto: string;
}

export interface ReporteIngresos {
  desde: string;
  hasta: string;
  agrupar_por: string;
  total_ingresos: string;
  total_reembolsos: string;
  total_neto: string;
  num_pagos: number;
  serie: SerieIngresoItem[];
}

// --- Cuentas por cobrar -----------------------------------------

export interface CuentaPorCobrarItem {
  reservacion_id: number;
  cliente_id: number;
  servicio_id: number;
  fecha_visita: string;
  estado: string;
  total: string;
  monto_pagado: string;
  saldo_pendiente: string;
  antiguedad_dias: number;
}

export interface ReporteCuentasPorCobrar {
  fecha_corte: string;
  num_reservaciones: number;
  total_pendiente: string;
  items: CuentaPorCobrarItem[];
}

// --- Ocupación ----------------------------------------------------

export interface OcupacionServicioItem {
  servicio_id: number;
  servicio_nombre: string;
  capacidad_maxima: number | null;
  num_reservaciones: number;
  total_personas: number;
  promedio_personas_por_reservacion: number;
  porcentaje_ocupacion_promedio: number | null;
}

export interface ReporteOcupacion {
  desde: string;
  hasta: string;
  items: OcupacionServicioItem[];
}

// --- Servicios más vendidos ---------------------------------------

export interface ServicioMasVendidoItem {
  servicio_id: number;
  servicio_nombre: string;
  num_reservaciones: number;
  total_facturado: string;
}

export interface ReporteServiciosMasVendidos {
  desde: string;
  hasta: string;
  items: ServicioMasVendidoItem[];
}

// --- Clientes frecuentes --------------------------------------------

export interface ClienteFrecuenteItem {
  cliente_id: number;
  cliente_nombre: string;
  num_reservaciones: number;
  total_gastado: string;
}

export interface ReporteClientesFrecuentes {
  desde: string;
  hasta: string;
  minimo_reservaciones: number;
  items: ClienteFrecuenteItem[];
}

// --- Reservaciones por estado --------------------------------------

export interface ReporteReservacionesPorEstado {
  desde: string;
  hasta: string;
  total: number;
  por_estado: Record<string, number>;
}

// --- Cancelaciones -----------------------------------------------

export interface CancelacionPorServicioItem {
  servicio_id: number;
  servicio_nombre: string;
  num_cancelaciones: number;
}

export interface ReporteCancelaciones {
  desde: string;
  hasta: string;
  total_reservaciones: number;
  num_canceladas: number;
  tasa_cancelacion: number;
  desglose_por_servicio: CancelacionPorServicioItem[];
}

// --- Tendencia de reservaciones -------------------------------------

export interface SerieTendenciaItem {
  periodo: string;
  num_reservaciones: number;
}

export interface ReporteTendenciaReservaciones {
  desde: string;
  hasta: string;
  agrupar_por: string;
  total: number;
  serie: SerieTendenciaItem[];
}

// --- Clientes nuevos ----------------------------------------------

export interface SerieClientesNuevosItem {
  periodo: string;
  num_clientes: number;
}

export interface ReporteClientesNuevos {
  desde: string;
  hasta: string;
  agrupar_por: string;
  total: number;
  serie: SerieClientesNuevosItem[];
}

// --- Próximas reservaciones -----------------------------------------

export interface ProximaReservacionItem {
  reservacion_id: number;
  cliente_id: number;
  cliente_nombre: string;
  servicio_id: number;
  servicio_nombre: string;
  fecha_visita: string;
  num_personas: number;
  estado: string;
}

export interface ReporteProximasReservaciones {
  desde: string;
  hasta: string;
  dias: number;
  total: number;
  items: ProximaReservacionItem[];
}
