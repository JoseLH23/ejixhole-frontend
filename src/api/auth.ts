import { apiClient } from "./client";
import type { LoginRequest, TokenResponse, UsuarioMe } from "@/types/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  /** GET /auth/me — perfil real del usuario autenticado. */
  me: async (): Promise<UsuarioMe> => {
    const response = await apiClient.get<UsuarioMe>("/auth/me");
    return response.data;
  },
};
