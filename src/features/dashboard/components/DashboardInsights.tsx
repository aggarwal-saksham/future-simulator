import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, PieChart as PieChartIcon } from "lucide-react";
import { SimulationResult } from "@/lib/forecasting";

interface DashboardInsightsProps {
  result: SimulationResult;
}

export function DashboardInsights({ result }: DashboardInsightsProps) {
  const endForecast = result.forecast.at(-1)?.central ?? 0;
  const barData = [
    { name: "Avg", value: result.metrics.average, fill: "#d5c5dd" },
    { name: "Latest", value: result.metrics.lastValue, fill: "#5e2974" },
    { name: "Baseline", value: result.baseline, fill: "#ef7846" },
    { name: "Forecast", value: endForecast, fill: "#8d57a3" },
  ];

  const healthMix = [
    { name: "Trend", value: Math.max(1, Math.round(30 + result.metrics.trendPercent)) },
    { name: "Band", value: Math.max(1, 100 - Math.round(result.metrics.projectedRangePercent)) },
    { name: "Anomaly", value: Math.max(1, 100 - result.metrics.anomalyCount * 18) },
    { name: "Cash Risk", value: Math.max(1, 100 - result.metrics.cashGapRisk) },
  ];

  const natwestMetrics = [
    { label: "Products Triggered", value: result.triggers.length },
    { label: "Highest Priority", value: result.triggers[0]?.severity ?? "none" },
    { label: "Band Width", value: `${result.metrics.projectedRangePercent.toFixed(0)}%` },
    { label: "Cash Risk", value: `${result.metrics.cashGapRisk}%` },
    { label: "Liquidity Buffer", value: `£${result.metrics.liquidityBuffer.toLocaleString()}` },
    { label: "NatWest Fit", value: `${result.metrics.natwestFitScore}/100` },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="panel-surface p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Performance Compare</p>
            <h3 className="text-xl font-semibold text-foreground">Historic vs projected levels</h3>
          </div>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `£${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {natwestMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground/85">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-surface p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <PieChartIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Risk Mix</p>
            <h3 className="text-xl font-semibold text-foreground">Health score composition</h3>
          </div>
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={healthMix}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={90}
                paddingAngle={3}
              >
                <Cell fill="#5e2974" />
                <Cell fill="#8d57a3" />
                <Cell fill="#ef7846" />
                <Cell fill="#d64d6f" />
              </Pie>
              <Tooltip formatter={(value: number) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3">
          {healthMix.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ["#5e2974", "#8d57a3", "#ef7846", "#d64d6f"][index] }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
