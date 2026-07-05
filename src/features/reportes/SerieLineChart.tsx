import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SerieLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { dataKey: string; name: string; color: string }[];
}

/**
 * Gráfica simple compartida por Ingresos, Tendencia de reservaciones y
 * Clientes nuevos — las 3 únicas respuestas del backend con forma de
 * serie de tiempo. Los valores Decimal (strings) se convierten a
 * número antes de llegar aquí, en cada página de reporte.
 */
export function SerieLineChart({ data, xKey, lines }: SerieLineChartProps) {
  return (
    <div className="h-72 w-full rounded-lg border border-border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
