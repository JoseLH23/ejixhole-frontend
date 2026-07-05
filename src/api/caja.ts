import { apiClient } from "./client";
import type {
  CajaAbrirInput,
  CajaCerrarInput,
  CajaMovimiento,
  CajaMovimientoCreateInput,
  CajaSesion,
  EstadoCaja,
} from "@/types/caja";

export interface ListarCajaSesionesParams {
  usuario_id?: number;
  estado?: EstadoCaja;
  limit?: number;
  offset?: number;
}

export const cajaApi = {
  abrir: async (data: CajaAbrirInput): Promise<CajaSesion> => {
    const response = await apiClient.post<CajaSesion>("/caja/abrir", data);
    return response.data;
  },

  listarSesiones: async (params: ListarCajaSesionesParams = {}): Promise<CajaSesion[]> => {
    const response = await apiClient.get<CajaSesion[]>("/caja", { params });
    return response.data;
  },

  obtenerSesion: async (sesionId: number): Promise<CajaSesion> => {
    const response = await apiClient.get<CajaSesion>(`/caja/${sesionId}`);
    return response.data;
  },

  cerrar: async (sesionId: number, data: CajaCerrarInput): Promise<CajaSesion> => {
    const response = await apiClient.post<CajaSesion>(`/caja/${sesionId}/cerrar`, data);
    return response.data;
  },

  registrarMovimiento: async (
    sesionId: number,
    data: CajaMovimientoCreateInput
  ): Promise<CajaMovimiento> => {
    const response = await apiClient.post<CajaMovimiento>(`/caja/${sesionId}/movimientos`, data);
    return response.data;
  },

  listarMovimientos: async (sesionId: number): Promise<CajaMovimiento[]> => {
    const response = await apiClient.get<CajaMovimiento[]>(`/caja/${sesionId}/movimientos`);
    return response.data;
  },

  // corte-dia no se consume en esta entrega (no fue pedido) — queda
  // disponible en el backend para una futura pantalla de "corte del
  // día", ver docs/entrega-3e.md.
};
