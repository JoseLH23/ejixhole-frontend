export function TableSkeleton({ filas = 6, columnas = 4 }: { filas?: number; columnas?: number }) {
  return (
    <div className="animate-pulse space-y-2 rounded-lg border border-border p-4">
      {Array.from({ length: filas }).map((_, fila) => (
        <div key={fila} className="flex gap-4">
          {Array.from({ length: columnas }).map((_, col) => (
            <div key={col} className="h-6 flex-1 rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}
