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
  saveRecommendationDecision: async (businessDate: string, code: string, decision: "accepted" | "dismissed") => {
    const response = await apiClient.post(`/dashboard/mh-core/predictions/recommendations/${code}/decision`, null, {
      params: { business_date: businessDate, decision },
    });
    return response.data;
  },
  saveRecommendationOutcome: async (businessDate: string, code: string, outcome: "helped" | "neutral" | "not_helpful") => {
    const response = await apiClient.post(`/dashboard/mh-core/predictions/recommendations/${code}/outcome`, null, {
      params: { business_date: businessDate, outcome },
    });
    return response.data;
  },
};
