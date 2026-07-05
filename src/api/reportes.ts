import { apiClient } from "./client";
import type {
  AgruparPorFecha,
  AgruparPorIngresos,
  Periodo,
  ReporteCancelaciones,
  ReporteClientesFrecuentes,
  ReporteClientesNuevos,
  ReporteCuentasPorCobrar,
  ReporteIngresos,
  ReporteOcupacion,
  ReporteProximasReservaciones,
  ReporteReservacionesPorEstado,
  ReporteServiciosMasVendidos,
  ReporteTendenciaReservaciones,
} from "@/types/reporte";

interface FiltrosFecha {
  periodo?: Periodo;
  desde?: string;
  hasta?: string;
}

export const reportesApi = {
  ingresos: async (
    params: FiltrosFecha & { agrupar_por?: AgruparPorIngresos; metodo_pago?: string; servicio_id?: number }
  ): Promise<ReporteIngresos> => {
    const response = await apiClient.get<ReporteIngresos>("/reportes/ingresos", { params });
    return response.data;
  },

  cuentasPorCobrar: async (params: { antiguedad_minima_dias?: number }): Promise<ReporteCuentasPorCobrar> => {
    const response = await apiClient.get<ReporteCuentasPorCobrar>("/reportes/cuentas-por-cobrar", {
      params,
    });
    return response.data;
  },

  ocupacion: async (params: FiltrosFecha & { servicio_id?: number }): Promise<ReporteOcupacion> => {
    const response = await apiClient.get<ReporteOcupacion>("/reportes/ocupacion", { params });
    return response.data;
  },

  serviciosMasVendidos: async (
    params: FiltrosFecha & { limit?: number }
  ): Promise<ReporteServiciosMasVendidos> => {
    const response = await apiClient.get<ReporteServiciosMasVendidos>("/reportes/servicios-mas-vendidos", {
      params,
    });
    return response.data;
  },

  clientesFrecuentes: async (
    params: FiltrosFecha & { limit?: number; minimo_reservaciones?: number }
  ): Promise<ReporteClientesFrecuentes> => {
    const response = await apiClient.get<ReporteClientesFrecuentes>("/reportes/clientes-frecuentes", {
      params,
    });
    return response.data;
  },

  reservacionesPorEstado: async (
    params: FiltrosFecha & { servicio_id?: number; origen?: string }
  ): Promise<ReporteReservacionesPorEstado> => {
    const response = await apiClient.get<ReporteReservacionesPorEstado>(
      "/reportes/reservaciones-por-estado",
      { params }
    );
    return response.data;
  },

  cancelaciones: async (params: FiltrosFecha): Promise<ReporteCancelaciones> => {
    const response = await apiClient.get<ReporteCancelaciones>("/reportes/cancelaciones", { params });
    return response.data;
  },

  tendenciaReservaciones: async (
    params: FiltrosFecha & { agrupar_por?: AgruparPorFecha; estado?: string }
  ): Promise<ReporteTendenciaReservaciones> => {
    const response = await apiClient.get<ReporteTendenciaReservaciones>(
      "/reportes/tendencia-reservaciones",
      { params }
    );
    return response.data;
  },

  clientesNuevos: async (
    params: FiltrosFecha & { agrupar_por?: AgruparPorFecha }
  ): Promise<ReporteClientesNuevos> => {
    const response = await apiClient.get<ReporteClientesNuevos>("/reportes/clientes-nuevos", { params });
    return response.data;
  },

  proximasReservaciones: async (params: {
    dias?: number;
    estado?: string;
  }): Promise<ReporteProximasReservaciones> => {
    const response = await apiClient.get<ReporteProximasReservaciones>(
      "/reportes/proximas-reservaciones",
      { params }
    );
    return response.data;
  },
};
