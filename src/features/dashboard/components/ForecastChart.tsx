import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Anomaly, ForecastPoint } from "@/lib/forecasting";
import { DataPoint } from "@/lib/sampleData";

interface ForecastChartProps {
  historicalData: DataPoint[];
  forecast: ForecastPoint[];
  anomalies: Anomaly[];
}

export function ForecastChart({ historicalData, forecast, anomalies }: ForecastChartProps) {
  const chartData = [
    ...historicalData.map((point) => ({
      label: point.label,
      actual: point.value,
      baseline: null,
      central: null,
      lowBand: null,
      highBand: null,
    })),
    ...forecast.map((point) => ({
      label: point.label,
      actual: null,
      baseline: point.baseline,
      central: point.central,
      lowBand: point.low,
      highBand: point.high,
    })),
  ];

  return (
    <motion.div
      className="panel-surface p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Step 4 — Output UI</p>
          <h3 className="text-2xl font-semibold text-foreground">Forecast Chart</h3>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={chartData} margin={{ left: -16, right: 16, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="forecast-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(82, 55, 97, 0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(73, 58, 83, 0.7)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(73, 58, 83, 0.7)", fontSize: 12 }}
            tickFormatter={(value) => `£${Math.round(value / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 20,
              border: "1px solid rgba(82, 55, 97, 0.12)",
              boxShadow: "0 18px 50px rgba(34, 22, 42, 0.10)",
              background: "rgba(255, 252, 249, 0.98)",
            }}
            formatter={(value: number, name: string) => [
              `£${Math.round(value).toLocaleString()}`,
              name.replace(/([A-Z])/g, " $1"),
            ]}
          />
          <Area dataKey="highBand" stroke="none" fill="url(#forecast-band)" />
          <Area dataKey="lowBand" stroke="none" fill="hsl(var(--card))" />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--foreground))"
            strokeWidth={3}
            dot={{ r: 3, fill: "hsl(var(--foreground))" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="central"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeDasharray="8 6"
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
          {anomalies.map((anomaly) => (
            <ReferenceDot
              key={anomaly.label}
              x={anomaly.label}
              y={anomaly.value}
              r={7}
              fill="hsl(var(--destructive))"
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-foreground" />
          Historic data
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-primary" />
          Central forecast
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-accent" />
          Baseline
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-destructive" />
          Anomalies
        </span>
      </div>
    </motion.div>
  );
}
