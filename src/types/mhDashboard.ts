export interface MhDashboardTimelineItem {
  date: string;
  reservations: number;
  net_revenue: string;
  visits: number;
  cancellations: number;
}

export interface MhDashboardMessage {
  code: string;
  severity?: "info" | "warning" | "critical";
  priority?: "low" | "medium" | "high";
  message: string;
}

export interface MhExecutiveDashboard {
  generated_at: string;
  business_date: string;
  period: { days: number; start: string; end: string };
  source: "ejixhole_events";
  access: "read_only";
  processed_events: number;
  kpis: {
    net_revenue: string;
    reservations_created: number;
    visits_completed: number;
    reservations_cancelled: number;
    cancellation_rate: number;
    active_reservations: number;
    pending_balance: string;
    upcoming_reservations_7_days: number;
    upcoming_people_7_days: number;
  };
  trends: {
    reservations_percent: number | null;
    net_revenue_percent: number | null;
    cancellations_percent: number | null;
    visits_percent: number | null;
  };
  timeline: MhDashboardTimelineItem[];
  breakdown: {
    reservations_by_status: Record<string, number>;
    reservations_by_type: Record<string, number>;
  };
  alerts: MhDashboardMessage[];
  recommendations: MhDashboardMessage[];
}
