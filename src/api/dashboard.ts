import { apiClient } from "./client";
import type { DashboardResumen } from "@/types/dashboard";
import type { MhExecutiveDashboard } from "@/types/mhDashboard";

export const dashboardApi = {
  getResumen: async (): Promise<DashboardResumen> => {
    const response = await apiClient.get<DashboardResumen>("/dashboard/resumen");
    return response.data;
  },
  getMhExecutive: async (days = 7): Promise<MhExecutiveDashboard> => {
    const response = await apiClient.get<MhExecutiveDashboard>("/dashboard/mh-core", { params: { days } });
    return response.data;
  },
};
