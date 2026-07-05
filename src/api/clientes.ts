import { apiClient } from "./client";
import type { Cliente, ClienteCreateInput, ClienteDuplicadoWarning, ClienteUpdateInput } from "@/types/cliente";

export interface ListarClientesParams {
  solo_activos?: boolean;
  limit?: number;
  offset?: number;
}

export const clientesApi = {
  listar: async (params: ListarClientesParams = {}): Promise<Cliente[]> => {
    const response = await apiClient.get<Cliente[]>("/clientes", { params });
    return response.data;
  },

  crear: async (data: ClienteCreateInput): Promise<ClienteDuplicadoWarning> => {
    const response = await apiClient.post<ClienteDuplicadoWarning>("/clientes", data);
    return response.data;
  },

  actualizar: async (id: number, data: ClienteUpdateInput): Promise<Cliente> => {
    const response = await apiClient.put<Cliente>(`/clientes/${id}`, data);
    return response.data;
  },

  desactivar: async (id: number): Promise<Cliente> => {
    const response = await apiClient.delete<Cliente>(`/clientes/${id}`);
    return response.data;
  },
};
