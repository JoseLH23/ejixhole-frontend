import { apiClient } from "./client";
import type {
  EstadoReservacion,
  Reservacion,
  ReservacionCreateInput,
  ReservacionEstadoUpdateInput,
} from "@/types/reservacion";

export interface ListarReservacionesParams {
  cliente_id?: number;
  servicio_id?: number;
  estado?: EstadoReservacion;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}

export const reservacionesApi = {
  listar: async (params: ListarReservacionesParams = {}): Promise<Reservacion[]> => {
    const response = await apiClient.get<Reservacion[]>("/reservaciones", { params });
    return response.data;
  },

  crear: async (data: ReservacionCreateInput): Promise<Reservacion> => {
    const response = await apiClient.post<Reservacion>("/reservaciones", data);
    return response.data;
  },

  cambiarEstado: async (id: number, data: ReservacionEstadoUpdateInput): Promise<Reservacion> => {
    const response = await apiClient.patch<Reservacion>(`/reservaciones/${id}/estado`, data);
    return response.data;
  },
};
