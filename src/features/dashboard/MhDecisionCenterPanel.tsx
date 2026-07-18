import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, History, RefreshCw, XCircle } from "lucide-react";

import { dashboardApi } from "@/api/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DecisionCenter = {
  summary: {
    total_decisions: number;
    accepted: number;
    dismissed: number;
    evaluated: number;
    pending_evaluation: number;
    helped_percent: number | null;
  };
  items: Array<{
    business_date: string;
    code: string;
    decision: "accepted" | "dismissed";
    decided_at: string;
    outcome: "helped" | "neutral" | "not_helpful" | null;
    outcome_note: string | null;
    outcome_at: string | null;
  }>;
};

const decisionLabel = (value: string) => value === "accepted" ? "Aplicada" : "Descartada";
const outcomeLabel = (value: string | null) => value === "helped" ? "Ayudó" : value === "neutral" ? "Neutral" : value === "not_helpful" ? "No ayudó" : "Pendiente";

export function MhDecisionCenterPanel() {
  const query = useQuery({
    queryKey: ["dashboard", "mh-core", "decisions", 50],
    queryFn: () => dashboardApi.getMhDecisions(50) as Promise<DecisionCenter>,
    staleTime: 60_000,
  });

  if (query.isLoading) return <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl" />;
  if (query.isError || !query.data) return <Card><CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><History className="h-8 w-8 text-muted-foreground" /><p className="font-semibold">No fue posible cargar el centro de decisiones</p><Button variant="outline" size="sm" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Reintentar</Button></CardContent></Card>;

  const { summary, items } = query.data;
  const metrics = [
    ["Decisiones", summary.total_decisions],
    ["Aplicadas", summary.accepted],
    ["Pendientes", summary.pending_evaluation],
    ["Ayudaron", summary.helped_percent == null ? "Sin datos" : `${summary.helped_percent}%`],
  ];

  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{metrics.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>)}</div>
    <Card><CardHeader className="pb-2"><CardTitle className="text-base">Historial reciente</CardTitle></CardHeader><CardContent className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay decisiones registradas.</p>}
      {items.map((item) => <div key={`${item.business_date}-${item.code}`} className="rounded-lg border p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium">{item.code}</p><p className="text-xs text-muted-foreground">{item.business_date}</p></div><span className="inline-flex items-center gap-1 text-xs">{item.decision === "accepted" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}{decisionLabel(item.decision)}</span></div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />Resultado: {outcomeLabel(item.outcome)}</div>
        {item.outcome_note && <p className="mt-2 rounded-md bg-muted/40 p-2 text-xs">{item.outcome_note}</p>}
      </div>)}
    </CardContent></Card>
  </div>;
}
