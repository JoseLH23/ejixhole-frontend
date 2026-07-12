import { apiClient } from "./client";
import type { UnidadHospedaje } from "@/types/unidadHospedaje";

/**
 * Reutiliza GET /publico/unidades-hospedaje — el mismo endpoint que
 * usa el sitio de reservaciones público. Es público (sin auth), pero
 * llamarlo desde el frontend interno (ya autenticado) no tiene ningún
 * problema — no expone nada que el sitio público no muestre ya. No se
 * crea un endpoint interno duplicado solo para esto.
 */
export const unidadesHospedajeApi = {
  listar: async (): Promise<UnidadHospedaje[]> => {
    const response = await apiClient.get<UnidadHospedaje[]>("/publico/unidades-hospedaje");
    return response.data;
  },
};
