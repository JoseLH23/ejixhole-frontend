import { useQuery } from "@tanstack/react-query";

import { reportesApi } from "@/api/reportes";
import type { AgruparPorFecha, AgruparPorIngresos, Periodo } from "@/types/reporte";

const REPORTES_QUERY_KEY = ["reportes"] as const;

interface FiltrosFecha {
  periodo?: Periodo;
  desde?: string;
  hasta?: string;
}

export function useReporteIngresos(
  params: FiltrosFecha & { agrupar_por?: AgruparPorIngresos; metodo_pago?: string; servicio_id?: number }
) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "ingresos", params],
    queryFn: () => reportesApi.ingresos(params),
    staleTime: 30_000,
  });
}

export function useReporteCuentasPorCobrar(params: { antiguedad_minima_dias?: number }) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "cuentas-por-cobrar", params],
    queryFn: () => reportesApi.cuentasPorCobrar(params),
    staleTime: 30_000,
  });
}

export function useReporteOcupacion(params: FiltrosFecha & { servicio_id?: number }) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "ocupacion", params],
    queryFn: () => reportesApi.ocupacion(params),
    staleTime: 30_000,
  });
}

export function useReporteServiciosMasVendidos(params: FiltrosFecha & { limit?: number }) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "servicios-mas-vendidos", params],
    queryFn: () => reportesApi.serviciosMasVendidos(params),
    staleTime: 30_000,
  });
}

export function useReporteClientesFrecuentes(
  params: FiltrosFecha & { limit?: number; minimo_reservaciones?: number }
) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "clientes-frecuentes", params],
    queryFn: () => reportesApi.clientesFrecuentes(params),
    staleTime: 30_000,
  });
}

export function useReporteReservacionesPorEstado(
  params: FiltrosFecha & { servicio_id?: number; origen?: string }
) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "reservaciones-por-estado", params],
    queryFn: () => reportesApi.reservacionesPorEstado(params),
    staleTime: 30_000,
  });
}

export function useReporteCancelaciones(params: FiltrosFecha) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "cancelaciones", params],
    queryFn: () => reportesApi.cancelaciones(params),
    staleTime: 30_000,
  });
}

export function useReporteTendenciaReservaciones(
  params: FiltrosFecha & { agrupar_por?: AgruparPorFecha; estado?: string }
) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "tendencia-reservaciones", params],
    queryFn: () => reportesApi.tendenciaReservaciones(params),
    staleTime: 30_000,
  });
}

export function useReporteClientesNuevos(params: FiltrosFecha & { agrupar_por?: AgruparPorFecha }) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "clientes-nuevos", params],
    queryFn: () => reportesApi.clientesNuevos(params),
    staleTime: 30_000,
  });
}

export function useReporteProximasReservaciones(params: { dias?: number; estado?: string }) {
  return useQuery({
    queryKey: [...REPORTES_QUERY_KEY, "proximas-reservaciones", params],
    queryFn: () => reportesApi.proximasReservaciones(params),
    staleTime: 30_000,
  });
}
