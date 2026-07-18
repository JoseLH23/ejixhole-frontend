import { apiClient } from "./client";
import type { AuditEvent, AuditEventFilters } from "@/types/auditEvent";

export const auditoriaApi = {
  listar: async (params: AuditEventFilters = {}): Promise<AuditEvent[]> => {
    const response = await apiClient.get<AuditEvent[]>("/auditoria", { params });
    return response.data;
  },
  obtener: async (id: number): Promise<AuditEvent> => {
    const response = await apiClient.get<AuditEvent>(`/auditoria/${id}`);
    return response.data;
  },
};
