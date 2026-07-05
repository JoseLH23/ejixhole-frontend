export function TableSkeleton({ filas = 6, columnas = 4 }: { filas?: number; columnas?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-premium">
      {Array.from({ length: filas }).map((_, fila) => (
        <div key={fila} className="flex gap-4">
          {Array.from({ length: columnas }).map((_, col) => (
            <div
              key={col}
              className="skeleton-shimmer h-6 flex-1 animate-shimmer rounded-md"
              style={{ animationDelay: `${fila * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
