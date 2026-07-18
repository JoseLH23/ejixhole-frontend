export type MhServiceProfitabilityItem = {
  service_id: string;
  service_name?: string | null;
  gross_revenue: string;
  refunds: string;
  net_revenue: string;
  completed_visits: number;
  costs: string | null;
  margin: string | null;
  cost_status: "missing" | "available";
};

export type MhServiceProfitability = {
  generated_at: string;
  period: { days: number; start: string; end: string };
  source: string;
  access: "read_only";
  totals: {
    gross_revenue: string;
    refunds: string;
    net_revenue: string;
    completed_visits: number;
  };
  cost_status: "missing" | "partial" | "available";
  message?: string | null;
  services: MhServiceProfitabilityItem[];
};
