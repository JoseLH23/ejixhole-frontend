import { apiClient } from "./client";
import type {
  SimulacionTarifaInput,
  SimulacionTarifaResultado,
  TarifaEspecial,
  TarifaEspecialInput,
} from "@/types/tarifaEspecial";

export const tarifasEspecialesApi = {
  listar: async (): Promise<TarifaEspecial[]> => {
    const response = await apiClient.get<TarifaEspecial[]>("/tarifas-especiales");
    return response.data;
  },
  simular: async (data: SimulacionTarifaInput): Promise<SimulacionTarifaResultado> => {
    const response = await apiClient.post<SimulacionTarifaResultado>("/tarifas-especiales/simular", data);
    return response.data;
  },
  crear: async (data: TarifaEspecialInput): Promise<TarifaEspecial> => {
    const response = await apiClient.post<TarifaEspecial>("/tarifas-especiales", data);
    return response.data;
  },
  actualizar: async (id: number, data: Partial<TarifaEspecialInput>): Promise<TarifaEspecial> => {
    const response = await apiClient.put<TarifaEspecial>(`/tarifas-especiales/${id}`, data);
    return response.data;
  },
  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/tarifas-especiales/${id}`);
  },
};
