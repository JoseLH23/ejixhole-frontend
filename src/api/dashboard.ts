import { apiClient } from "./client";
import type { DashboardResumen } from "@/types/dashboard";
import type { MhExecutiveDashboard } from "@/types/mhDashboard";
import type { MhPredictions, MhPredictionEvaluation } from "@/types/mhPredictions";

export const dashboardApi = {
  getResumen: async (): Promise<DashboardResumen> => {
    const response = await apiClient.get<DashboardResumen>("/dashboard/resumen");
    return response.data;
  },
  getMhExecutive: async (days = 7): Promise<MhExecutiveDashboard> => {
    const response = await apiClient.get<MhExecutiveDashboard>("/dashboard/mh-core", { params: { days } });
    return response.data;
  },
  getMhPredictions: async (days = 7): Promise<MhPredictions> => {
    const response = await apiClient.get<MhPredictions>("/dashboard/mh-core/predictions", { params: { days } });
    return response.data;
  },
  getMhEvaluation: async (limit = 12): Promise<MhPredictionEvaluation> => {
    const response = await apiClient.get<MhPredictionEvaluation>("/dashboard/mh-core/predictions/evaluation", { params: { limit } });
    return response.data;
  },
};
