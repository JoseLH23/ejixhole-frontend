import { apiClient } from "./client";
import type {
  EstadoReservacion,
  Reservacion,
  ReservacionCreateInput,
  ReservacionEstadoUpdateInput,
  ReservacionUpdateInput,
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

  crear: async (data: ReservacionCreateInput, idempotencyKey?: string): Promise<Reservacion> => {
    const response = await apiClient.post<Reservacion>("/reservaciones", data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    });
    return response.data;
  },

  actualizar: async (id: number, data: ReservacionUpdateInput): Promise<Reservacion> => {
    const response = await apiClient.put<Reservacion>(`/reservaciones/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id: number, data: ReservacionEstadoUpdateInput): Promise<Reservacion> => {
    const response = await apiClient.patch<Reservacion>(`/reservaciones/${id}/estado`, data);
    return response.data;
  },

  checkIn: async (id: number): Promise<Reservacion> => {
    const response = await apiClient.post<Reservacion>(`/reservaciones/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id: number): Promise<Reservacion> => {
    const response = await apiClient.post<Reservacion>(`/reservaciones/${id}/check-out`);
    return response.data;
  },
};
