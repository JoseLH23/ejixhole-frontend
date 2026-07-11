import { Card, CardContent } from "@/components/ui/card";

/** Refleja la forma real del Dashboard (Entrega 8): franja + hero + 4 KPIs + cuerpo de 3 columnas. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-5 w-64 animate-shimmer rounded-md" />
      <div className="skeleton-shimmer h-60 animate-shimmer rounded-2xl" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
            <CardContent className="space-y-3 p-5">
              <div className="skeleton-shimmer h-10 w-10 animate-shimmer rounded-full" />
              <div className="skeleton-shimmer h-3 w-24 animate-shimmer rounded-md" />
              <div className="skeleton-shimmer h-7 w-20 animate-shimmer rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl lg:col-span-4" />
        <div className="skeleton-shimmer h-64 animate-shimmer rounded-xl lg:col-span-5" />
        <div className="space-y-4 lg:col-span-3">
          <div className="skeleton-shimmer h-32 animate-shimmer rounded-xl" />
          <div className="skeleton-shimmer h-28 animate-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}
