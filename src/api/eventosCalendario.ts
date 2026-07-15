import { apiClient } from "./client";
import type { EventoCalendario, EventoCalendarioCreateInput } from "@/types/eventoCalendario";

export const eventosCalendarioApi = {
  listar: async (params: { desde?: string; hasta?: string } = {}): Promise<EventoCalendario[]> => {
    const response = await apiClient.get<EventoCalendario[]>("/eventos-calendario", { params });
    return response.data;
  },

  crear: async (data: EventoCalendarioCreateInput): Promise<EventoCalendario> => {
    const response = await apiClient.post<EventoCalendario>("/eventos-calendario", data);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/eventos-calendario/${id}`);
  },
};
