import { apiClient } from "./client";
import type { CampaignBrief, MarketingCampaign, MarketingStatus } from "@/types/marketing";

export const marketingApi = {
  getStatus: async (): Promise<MarketingStatus> => {
    const response = await apiClient.get<MarketingStatus>("/marketing/status");
    return response.data;
  },

  createDraft: async (brief: CampaignBrief): Promise<MarketingCampaign> => {
    const response = await apiClient.post<MarketingCampaign>("/marketing/campaigns/draft", brief);
    return response.data;
  },
};
