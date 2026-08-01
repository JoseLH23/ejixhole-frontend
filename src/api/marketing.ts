import { apiClient } from "./client";
import type { CampaignBrief, MarketingCampaign, MarketingStatus } from "@/types/marketing";

const WAKEUP_POLL_INTERVAL_MS = 5_000;
const WAKEUP_MAX_ATTEMPTS = 18;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export const marketingApi = {
  getStatus: async (): Promise<MarketingStatus> => {
    let lastStatus: MarketingStatus | null = null;

    for (let attempt = 0; attempt < WAKEUP_MAX_ATTEMPTS; attempt += 1) {
      const response = await apiClient.get<MarketingStatus>("/marketing/status");
      lastStatus = response.data;

      if (!lastStatus.warming_up) {
        return lastStatus;
      }

      await wait(WAKEUP_POLL_INTERVAL_MS);
    }

    return (
      lastStatus ?? {
        configured: true,
        available: false,
        warming_up: true,
        knowledge_version: null,
        documents: 0,
        message: "Marketing continúa despertando. Comprueba la conexión nuevamente.",
      }
    );
  },

  createDraft: async (brief: CampaignBrief): Promise<MarketingCampaign> => {
    const response = await apiClient.post<MarketingCampaign>("/marketing/campaigns/draft", brief);
    return response.data;
  },
};
