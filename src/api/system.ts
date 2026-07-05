import { apiClient } from "./client";

export interface EstadoBackend {
  status: string;
  project: string;
  version: string;
}

/**
 * GET /status es público (sin auth) en el backend — se usa aquí
 * únicamente para el indicador "Sistema en línea" del Topbar. No es
 * un endpoint nuevo: ya existía desde la Fase 1 del backend.
 */
export const systemApi = {
  status: async (): Promise<EstadoBackend> => {
    const response = await apiClient.get<EstadoBackend>("/status");
    return response.data;
  },
};
