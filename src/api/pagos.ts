import { apiClient } from "./client";
import type { MetodoPago, Pago, PagoCreateInput, TipoPago } from "@/types/pago";

export interface ListarPagosParams {
  reservacion_id?: number;
  tipo?: TipoPago;
  metodo_pago?: MetodoPago;
  limit?: number;
  offset?: number;
}

export const pagosApi = {
  listar: async (params: ListarPagosParams = {}): Promise<Pago[]> => {
    const response = await apiClient.get<Pago[]>("/pagos", { params });
    return response.data;
  },

  listarPorReservacion: async (reservacionId: number): Promise<Pago[]> => {
    const response = await apiClient.get<Pago[]>(`/pagos/reservacion/${reservacionId}`);
    return response.data;
  },

  crear: async (data: PagoCreateInput, idempotencyKey?: string): Promise<Pago> => {
    const response = await apiClient.post<Pago>("/pagos", data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    });
    return response.data;
  },
};
