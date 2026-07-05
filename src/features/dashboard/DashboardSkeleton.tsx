import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 w-32 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-24 rounded bg-muted" />
            <div className="mt-2 h-4 w-40 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
