import { apiClient } from "./client";
import type { Servicio, ServicioCreateInput, ServicioUpdateInput } from "@/types/servicio";

export interface ListarServiciosParams {
  solo_activos?: boolean;
  categoria?: string;
  limit?: number;
  offset?: number;
}

export const serviciosApi = {
  listar: async (params: ListarServiciosParams = {}): Promise<Servicio[]> => {
    const response = await apiClient.get<Servicio[]>("/servicios", { params });
    return response.data;
  },

  crear: async (data: ServicioCreateInput): Promise<Servicio> => {
    const response = await apiClient.post<Servicio>("/servicios", data);
    return response.data;
  },

  actualizar: async (id: number, data: ServicioUpdateInput): Promise<Servicio> => {
    const response = await apiClient.put<Servicio>(`/servicios/${id}`, data);
    return response.data;
  },

  desactivar: async (id: number): Promise<Servicio> => {
    const response = await apiClient.delete<Servicio>(`/servicios/${id}`);
    return response.data;
  },
};
