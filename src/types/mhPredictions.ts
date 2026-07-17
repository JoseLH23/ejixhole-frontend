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

export interface MhPredictionEvaluationItem {
  business_date: string;
  horizon: { start: string; end: string };
  expected: { visitors: number; revenue: string };
  actual: { visitors: number; revenue: string };
  accuracy: { visitors_percent: number; revenue_percent: number; overall_percent: number };
  original_confidence: string;
}

export interface MhPredictionEvaluation {
  as_of: string;
  source: string;
  access: string;
  evaluated_predictions: number;
  overall_accuracy_percent: number | null;
  evaluations: MhPredictionEvaluationItem[];
  message: string | null;
}
