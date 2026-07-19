export type HealthStatus = "healthy" | "degraded" | "unknown" | "up" | "down" | "unavailable";

export interface BackendObservability {
  generated_at: string;
  status: "healthy" | "degraded";
  checks: {
    database: boolean;
    http_slo: boolean;
  };
  dependencies: {
    database: {
      status: "up" | "down";
      latency_ms: number;
    };
  };
  http: {
    uptime_seconds: number;
    window: {
      sample_limit: number;
      samples: number;
      started_at: string | null;
      ended_at: string | null;
    };
    requests: {
      total: number;
      lifetime_total: number;
      active: number;
      by_status_group: Record<string, number>;
      server_errors: number;
    };
    latency_ms: {
      samples: number;
      p50: number;
      p95: number;
      max: number;
    };
    slo: {
      status: "healthy" | "degraded";
      measurement: string;
      availability_percent: number;
      error_rate_percent: number;
      targets: {
        availability_percent: number;
        error_rate_percent: number;
        latency_p95_ms: number;
      };
      checks: Record<string, boolean>;
    };
    last_server_error_at: string | null;
  };
}

export interface MhCoreObservability {
  generated_at: string;
  status: "healthy" | "degraded";
  started_at: string;
  current: {
    timestamp: string;
    healthy: boolean;
    checks: {
      persistence: {
        status: "up" | "down";
        latency_ms: number;
        backend?: string;
      };
      ejixhole_state: {
        status: "up" | "down";
        latency_ms: number;
        backend?: string;
      };
      durable_jobs: {
        status: "up" | "down";
        latency_ms: number;
        pending?: number;
        running?: number;
        dead_letter?: number;
      };
    };
  };
  slo: {
    status: "healthy" | "degraded" | "unknown";
    measurement: string;
    availability_percent: number | null;
    target_percent: number;
    known_seconds: number;
    healthy_seconds: number;
    unknown_seconds: number;
    measurement_complete: boolean;
    checks: {
      availability: boolean | null;
      dependencies: boolean;
      dead_letter: boolean | null;
    };
  };
}

export type DiagnosticResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "unavailable" };

export interface EcosystemObservability {
  backend: DiagnosticResult<BackendObservability>;
  mhCore: DiagnosticResult<MhCoreObservability>;
  checkedAt: string;
}
