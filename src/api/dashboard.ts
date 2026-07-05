import { apiClient } from "./client";
import type { DashboardResumen } from "@/types/dashboard";

export const dashboardApi = {
  getResumen: async (): Promise<DashboardResumen> => {
    const response = await apiClient.get<DashboardResumen>("/dashboard/resumen");
    return response.data;
  },
};
