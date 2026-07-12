import { apiClient } from "./client";
import type { Usuario } from "@/types/usuario";

export interface ListarUsuariosParams {
  limit?: number;
  offset?: number;
}

export const usuariosApi = {
  listar: async (params: ListarUsuariosParams = {}): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>("/usuarios", { params });
    return response.data;
  },
};
