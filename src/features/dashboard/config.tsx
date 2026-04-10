import { Activity, LineChart, ShieldCheck } from "lucide-react";
import { CURATED_NEWS_SIGNALS, SimulationConfig, SimulationResult } from "@/lib/forecasting";

export const defaultSimulationConfig: SimulationConfig = {
  horizon: 6,
  growthRate: 8,
  removeOutliers: false,
  expenseShock: 4,
  hiringPlan: 2,
  capexPlan: false,
  marketingBoost: 6,
  priceChange: 2,
  supplierRisk: 5,
  fxSensitivity: 4,
  inventoryWeeks: 4,
  includeNews: true,
  selectedNewsIds: CURATED_NEWS_SIGNALS.filter((signal) => signal.selected).map((signal) => signal.id),
};

export const baselineSimulationConfig: SimulationConfig = {
  ...defaultSimulationConfig,
  growthRate: 0,
  expenseShock: 0,
  hiringPlan: 0,
  capexPlan: false,
  marketingBoost: 0,
  priceChange: 0,
  supplierRisk: 0,
  fxSensitivity: 0,
  inventoryWeeks: 2,
  includeNews: false,
  selectedNewsIds: [],
};

export const dashboardMetricCards = [
  {
    label: "Trend",
    icon: LineChart,
    getValue: (result: SimulationResult) =>
      `${result.metrics.trendPercent > 0 ? "+" : ""}${result.metrics.trendPercent.toFixed(1)}%`,
    getTone: (result: SimulationResult) =>
      result.metrics.trendPercent >= 0 ? "text-emerald-700" : "text-rose-700",
  },
  {
    label: "Confidence",
    icon: ShieldCheck,
    getValue: (result: SimulationResult) => `${result.metrics.confidenceScore}/100`,
    getTone: () => "text-primary",
  },
  {
    label: "Cash Gap Risk",
    icon: Activity,
    getValue: (result: SimulationResult) => `${result.metrics.cashGapRisk}%`,
    getTone: (result: SimulationResult) =>
      result.metrics.cashGapRisk <= 30 ? "text-emerald-700" : "text-rose-700",
  },
];
