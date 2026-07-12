import { apiClient } from "./client";
import type { Rol, Usuario, UsuarioCreateInput } from "@/types/usuario";

export interface ListarUsuariosParams {
  limit?: number;
  offset?: number;
}

export const usuariosApi = {
  listar: async (params: ListarUsuariosParams = {}): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>("/usuarios", { params });
    return response.data;
  },

  roles: async (): Promise<Rol[]> => {
    const response = await apiClient.get<Rol[]>("/usuarios/roles");
    return response.data;
  },

  /** POST /auth/usuarios — la ruta de creación real vive en /auth (auth_routes.py),
   * no se duplica esa lógica aquí, solo se llama desde el mismo lugar que el resto de Usuarios. */
  crear: async (data: UsuarioCreateInput): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>("/auth/usuarios", data);
    return response.data;
  },

  desactivar: async (id: number): Promise<Usuario> => {
    const response = await apiClient.delete<Usuario>(`/usuarios/${id}`);
    return response.data;
  },
};
