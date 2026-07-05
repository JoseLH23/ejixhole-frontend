import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} style={{ animationDelay: `${i * 30}ms` }} className="animate-fade-in-up">
          <CardHeader className="pb-2">
            <div className="skeleton-shimmer h-4 w-32 animate-shimmer rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="skeleton-shimmer h-8 w-24 animate-shimmer rounded-md" />
            <div className="skeleton-shimmer mt-2 h-4 w-40 animate-shimmer rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
