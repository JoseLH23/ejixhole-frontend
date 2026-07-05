interface ResumenStatsProps {
  items: { label: string; value: string | number }[];
}

/** Fila de números resumen, reutilizada en varios reportes (total, num_pagos, tasa, etc). */
export function ResumenStats({ items }: ResumenStatsProps) {
  return (
    <div className="flex flex-wrap gap-6 rounded-lg border border-border bg-card p-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="font-mono text-xl font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
