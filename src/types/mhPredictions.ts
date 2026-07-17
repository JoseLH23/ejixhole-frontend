export interface MhPredictions {
  generated_at: string;
  business_date: string;
  source: string;
  access: "read_only";
  confidence: "low" | "medium" | "high";
  predictions: {
    expected_visitors_7_days: number;
    expected_revenue_7_days: string;
    activity_level: "bajo" | "medio" | "alto";
    cancellation_risk: "bajo" | "medio" | "alto";
    upcoming_reservations_7_days: number;
  };
  explanations: string[];
  recommendations: Array<{
    code: string;
    priority: "low" | "medium" | "high";
    message: string;
  }>;
}
