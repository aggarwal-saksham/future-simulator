import { format, parseISO } from "date-fns";
import { DataPoint } from "@/lib/sampleData";

export type Severity = "low" | "medium" | "high";
export type TriggerType =
  | "CASH_DIP"
  | "GROWTH_SPIKE"
  | "FX_EXPOSURE"
  | "SEASONAL_SPIKE"
  | "PAYROLL_GAP"
  | "CASH_SURPLUS"
  | "CAPEX_SCENARIO"
  | "SUPPLY_DISRUPTION";

export interface ForecastPoint {
  label: string;
  low: number;
  central: number;
  high: number;
  baseline: number;
}

export interface Anomaly {
  label: string;
  value: number;
  reason: string;
  severity: Severity;
}

export interface Trigger {
  type: TriggerType;
  signal: string;
  severity: Severity;
  product: string;
  explanation: string;
  prefillData: Record<string, string>;
}

export interface NewsSignal {
  id: string;
  title: string;
  source: string;
  category: "demand" | "supply" | "fx" | "cost" | "confidence";
  impact: number;
  summary: string;
  selected: boolean;
}

export interface SimulationConfig {
  horizon: number;
  growthRate: number;
  removeOutliers: boolean;
  expenseShock: number;
  hiringPlan: number;
  capexPlan: boolean;
  marketingBoost: number;
  priceChange: number;
  supplierRisk: number;
  fxSensitivity: number;
  inventoryWeeks: number;
  includeNews: boolean;
  selectedNewsIds: string[];
}

export interface SimulationMetrics {
  average: number;
  lastValue: number;
  trendPercent: number;
  projectedRangePercent: number;
  anomalyCount: number;
  cashGapRisk: number;
  confidenceScore: number;
  natwestFitScore: number;
  liquidityBuffer: number;
}

export interface SimulationResult {
  forecast: ForecastPoint[];
  anomalies: Anomaly[];
  baseline: number;
  triggers: Trigger[];
  summary: string;
  insightHeadline: string;
  natwestActionLabel: string;
  healthScore: number;
  newsImpact: string;
  metrics: SimulationMetrics;
}

export const CURATED_NEWS_SIGNALS: NewsSignal[] = [
  {
    id: "supply-logistics",
    title: "Freight delays are increasing across major UK and EU routes",
    source: "Demo signal",
    category: "supply",
    impact: -10,
    summary: "Longer lead times can squeeze inventory-heavy businesses and make cash timing less predictable.",
    selected: true,
  },
  {
    id: "consumer-confidence",
    title: "Consumer demand improves for premium home and lifestyle segments",
    source: "Demo signal",
    category: "demand",
    impact: 8,
    summary: "Rising discretionary spend can lift short-term demand if you are positioned to fulfil it.",
    selected: true,
  },
  {
    id: "fx-sterling",
    title: "Sterling volatility raises margin risk for imported goods",
    source: "Demo signal",
    category: "fx",
    impact: -6,
    summary: "Businesses with imported inputs may see margin compression without FX protection.",
    selected: false,
  },
];

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const percentage = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const mean = (values: number[]) =>
  values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);

const stdDev = (values: number[]) => {
  const avg = mean(values);
  const variance = mean(values.map((value) => (value - avg) ** 2));
  return Math.sqrt(variance);
};

const linearRegressionSlope = (values: number[]) => {
  const xAvg = (values.length - 1) / 2;
  const yAvg = mean(values);

  let numerator = 0;
  let denominator = 0;

  values.forEach((value, index) => {
    numerator += (index - xAvg) * (value - yAvg);
    denominator += (index - xAvg) ** 2;
  });

  return denominator === 0 ? 0 : numerator / denominator;
};

const movingAverage = (values: number[], windowSize: number) =>
  mean(values.slice(Math.max(0, values.length - windowSize)));

const toDisplayLabel = (label: string) => {
  const trimmed = label.trim();

  if (/^\d+$/.test(trimmed)) {
    return `Week ${trimmed}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return format(parseISO(trimmed), "d MMM");
  }

  return trimmed;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildSummary = (
  config: SimulationConfig,
  metrics: SimulationMetrics,
  anomalies: Anomaly[],
  triggers: Trigger[],
  newsImpact: string,
) => {
  const trendDirection = metrics.trendPercent >= 0 ? "upward" : "downward";
  const anomalyText =
    anomalies.length === 0
      ? "No major anomalies were detected in the uploaded history."
      : `${anomalies.length} anomaly${anomalies.length === 1 ? "" : "ies"} need review before committing capital.`;
  const triggerText =
    triggers.length === 0
      ? "No urgent banking intervention is recommended right now."
      : `${triggers[0].product} is the strongest NatWest fit based on the forecasted signal profile.`;

  return `The next ${config.horizon} weeks point to a ${trendDirection} path of ${percentage(
    metrics.trendPercent,
  )} versus the current run rate, with a projected confidence spread of ${metrics.projectedRangePercent.toFixed(
    1,
  )}%. ${anomalyText} ${newsImpact} ${triggerText}`;
};

export const parseDataset = (rows: Record<string, string>[]) => {
  if (rows.length === 0) {
    throw new Error("No rows found in the uploaded data.");
  }

  const headers = Object.keys(rows[0]);
  const labelKey = headers.find((header) => /date|time|week|period|month/i.test(header));
  const valueKey = headers.find((header) => /value|amount|sales|revenue|total|metric/i.test(header));

  if (!labelKey || !valueKey) {
    throw new Error("Could not detect the date/period column and value column automatically.");
  }

  const parsed = rows
    .map((row) => ({
      label: row[labelKey]?.trim(),
      value: Number(String(row[valueKey] ?? "").replace(/[^\d.-]/g, "")),
    }))
    .filter((row) => row.label && Number.isFinite(row.value));

  if (parsed.length < 8) {
    throw new Error("Please provide at least 8 valid rows so the forecast can establish a baseline.");
  }

  return parsed.map((point) => ({
    ...point,
    label: toDisplayLabel(point.label),
  }));
};

export function generateSimulation(
  data: DataPoint[],
  config: SimulationConfig,
  newsSignals: NewsSignal[],
): SimulationResult {
  const values = data.map((point) => point.value);
  const volatility = stdDev(values);
  const historicalAverage = mean(values);
  const lastValue = values[values.length - 1];
  const slope = linearRegressionSlope(values.slice(-8));
  const baseline = movingAverage(values, 4);

  const anomalies = data.reduce<Anomaly[]>((accumulator, point, index) => {
    const neighbourhood = values.slice(Math.max(0, index - 3), Math.min(values.length, index + 4));
    const localAverage = mean(neighbourhood);
    const distance = Math.abs(point.value - localAverage);

    if (distance >= Math.max(volatility * 1.4, historicalAverage * 0.18)) {
      accumulator.push({
        label: point.label,
        value: point.value,
        reason:
          point.value < localAverage
            ? "Material dip against the local trend. This may reflect a stock issue, outage, or one-off disruption."
            : "Material spike against the local trend. This may reflect seasonality, promotion, or a large contract.",
        severity: distance > volatility * 2 ? "high" : "medium",
      });
    }

    return accumulator;
  }, []);

  const filteredValues = config.removeOutliers
    ? values.filter((value) => Math.abs(value - historicalAverage) <= volatility * 1.9)
    : values;
  const filteredAverage = mean(filteredValues);
  const filteredSlope = linearRegressionSlope(filteredValues.slice(-8));

  const selectedNews = newsSignals.filter(
    (signal) => config.includeNews && config.selectedNewsIds.includes(signal.id),
  );
  const newsImpactScore = selectedNews.reduce((total, signal) => total + signal.impact, 0);

  const weeklyTrendRate =
    (filteredSlope / Math.max(filteredAverage, 1)) * 0.9 + config.growthRate / 100 / Math.max(config.horizon, 1);
  const weeklyExpenseDrag = config.expenseShock / 100 / 8;
  const weeklyHiringDrag = config.hiringPlan * 0.006;
  const weeklyNewsAdjustment = newsImpactScore / 100 / 10;
  const weeklyMarketingLift = config.marketingBoost / 100 / 12;
  const weeklyPriceLift = config.priceChange / 100 / 10;
  const weeklySupplierDrag = config.supplierRisk / 100 / 12;
  const weeklyFxDrag = config.fxSensitivity / 100 / 14;
  const capexDrag = config.capexPlan ? 0.012 : 0;

  const forecast: ForecastPoint[] = [];
  let currentValue = lastValue;

  for (let week = 1; week <= config.horizon; week += 1) {
    const baselineProjection = baseline + filteredSlope * week;
    const scenarioRate =
      weeklyTrendRate -
      weeklyExpenseDrag -
      weeklyHiringDrag -
      weeklySupplierDrag -
      weeklyFxDrag -
      capexDrag +
      weeklyNewsAdjustment +
      weeklyMarketingLift +
      weeklyPriceLift;

    currentValue = Math.max(
      0,
      currentValue * (1 + scenarioRate) + filteredSlope * 0.35,
    );

    const bandWidth =
      volatility * (0.65 + week * 0.14) +
      Math.max(0, config.expenseShock - newsImpactScore) * 28 +
      config.hiringPlan * 180 +
      config.supplierRisk * 110 +
      config.fxSensitivity * 85;

    forecast.push({
      label: `Week +${week}`,
      central: Math.round(currentValue),
      low: Math.max(0, Math.round(currentValue - bandWidth)),
      high: Math.round(currentValue + bandWidth),
      baseline: Math.max(0, Math.round(baselineProjection)),
    });
  }

  const totalTrendPercent =
    ((forecast[forecast.length - 1]?.central ?? lastValue) - lastValue) / Math.max(lastValue, 1) * 100;
  const averageBandWidth = mean(
    forecast.map((point) => (point.high - point.low) / Math.max(point.central, 1) * 100),
  );
  const cashGapRisk = clamp(
    forecast.filter((point) => point.low < baseline * 0.82).length / Math.max(config.horizon, 1) * 100,
    0,
    100,
  );

  const trendScore = clamp(50 + totalTrendPercent * 2, 0, 100);
  const bandScore = clamp(100 - averageBandWidth * 2.2, 0, 100);
  const anomalyScore = clamp(100 - anomalies.length * 18, 0, 100);
  const cashGapScore = clamp(100 - cashGapRisk, 0, 100);
  const liquidityBuffer = Math.round(mean(forecast.map((point) => point.central - point.low)));
  const healthScore = Math.round(
    trendScore * 0.3 + bandScore * 0.25 + anomalyScore * 0.25 + cashGapScore * 0.2,
  );

  const triggers: Trigger[] = [];

  if (forecast.some((point) => point.low < historicalAverage * 0.75)) {
    triggers.push({
      type: "CASH_DIP",
      signal: "Lower forecast band drops below the safe operating range.",
      severity: "high",
      product: "Business Overdraft",
      explanation:
        "The downside case suggests a temporary working-capital shortfall. An overdraft gives immediate cover for timing gaps before cash receipts recover.",
      prefillData: {
        amount: currency.format(Math.max(historicalAverage * 0.25, 5000)),
        window: `${config.horizon} weeks`,
        confidence: `${Math.round(100 - cashGapRisk)}% stable-case confidence`,
      },
    });
  }

  if (totalTrendPercent > 12) {
    triggers.push({
      type: "GROWTH_SPIKE",
      signal: `Central case shows ${percentage(totalTrendPercent)} growth by the end of the horizon.`,
      severity: "medium",
      product: "Business Growth Loan",
      explanation:
        "Demand appears to be accelerating faster than the current operating base. Growth funding can help you expand inventory, hiring, or marketing without choking cash flow.",
      prefillData: {
        amount: currency.format(Math.max(lastValue * 0.35, 12000)),
        window: `${config.horizon} weeks`,
        confidence: `${Math.round(100 - averageBandWidth)}% demand confidence`,
      },
    });
  }

  if (config.hiringPlan >= 3 && forecast.some((point) => point.low < lastValue * 0.85)) {
    triggers.push({
      type: "PAYROLL_GAP",
      signal: "Hiring pressure coincides with a tighter near-term lower band.",
      severity: "medium",
      product: "Credit Bridge",
      explanation:
        "The forecast suggests payroll could arrive before the next strong inflow. A short-term credit bridge can smooth team expansion while revenue catches up.",
      prefillData: {
        amount: currency.format(config.hiringPlan * 4500),
        window: "4-8 weeks",
        confidence: `${Math.round(100 - cashGapRisk)}% timing confidence`,
      },
    });
  }

  if (config.capexPlan) {
    triggers.push({
      type: "CAPEX_SCENARIO",
      signal: "You flagged an upcoming investment scenario in the simulation settings.",
      severity: "low",
      product: "Asset Finance",
      explanation:
        "If the expansion plan includes equipment or fit-out spend, asset finance can preserve liquidity while still letting you invest against the forecast.",
      prefillData: {
        amount: currency.format(Math.max(lastValue * 0.4, 15000)),
        window: "12-36 months",
        confidence: `${Math.round(trendScore)}% trend confidence`,
      },
    });
  }

  if (selectedNews.some((signal) => signal.category === "supply")) {
    triggers.push({
      type: "SUPPLY_DISRUPTION",
      signal: "Selected news signals point to near-term supply friction.",
      severity: "medium",
      product: "Trade Finance",
      explanation:
        "Supply-side volatility often stretches payment timing and reorder cycles. Trade finance can help maintain flow while lead times normalize.",
      prefillData: {
        amount: currency.format(Math.max(filteredAverage * 0.2, 7000)),
        window: "30-90 days",
        confidence: `${Math.round(100 - averageBandWidth)}% supply confidence`,
      },
    });
  }

  if (selectedNews.some((signal) => signal.category === "fx")) {
    triggers.push({
      type: "FX_EXPOSURE",
      signal: "External signals indicate meaningful currency volatility.",
      severity: "medium",
      product: "FX Hedging",
      explanation:
        "If your margins depend on imported goods or foreign invoices, hedging can reduce surprise swings that would otherwise distort the forecast.",
      prefillData: {
        amount: currency.format(Math.max(filteredAverage * 0.18, 5000)),
        window: `${config.horizon} weeks`,
        confidence: `${Math.round(100 - averageBandWidth / 2)}% margin confidence`,
      },
    });
  }

  if (config.inventoryWeeks >= 6 || (config.marketingBoost >= 10 && totalTrendPercent > 8)) {
    triggers.push({
      type: "SEASONAL_SPIKE",
      signal: "Inventory cover and demand assumptions point to a stock build requirement.",
      severity: "medium",
      product: "Inventory Finance",
      explanation:
        `Projected demand is running ${percentage(totalTrendPercent)} with ${config.inventoryWeeks} weeks of stock cover in play. Inventory finance can fund the build-up without pulling too much cash out of operations.`,
      prefillData: {
        amount: currency.format(Math.max(filteredAverage * 0.22, 8000)),
        window: `${config.inventoryWeeks} weeks`,
        confidence: `${Math.round(100 - averageBandWidth)}% stock confidence`,
      },
    });
  }

  if (forecast.every((point) => point.low > historicalAverage * 1.02)) {
    triggers.push({
      type: "CASH_SURPLUS",
      signal: "Even the downside case remains above the historic base rate.",
      severity: "low",
      product: "Business Savings Account",
      explanation:
        "This scenario shows a comfortable cash buffer. Parking surplus funds in a savings product could improve yield without overcommitting capital.",
      prefillData: {
        amount: currency.format(Math.max(lastValue * 0.15, 3000)),
        window: `${config.horizon} weeks`,
        confidence: `${Math.round(cashGapScore)}% buffer confidence`,
      },
    });
  }

  const newsImpact =
    selectedNews.length === 0
      ? "No external news signals are currently applied to this forecast."
      : `News signals are contributing a net ${newsImpactScore >= 0 ? "positive" : "negative"} pressure of ${percentage(
          newsImpactScore,
        )} across demand, supply, and margin assumptions.`;

  const natwestFitScore = clamp(
    Math.round(
      triggers.length * 18 +
        Math.max(0, totalTrendPercent) +
        cashGapRisk * 0.4 +
        config.fxSensitivity * 1.8 +
        config.supplierRisk * 1.4 +
        config.inventoryWeeks * 1.2,
    ),
    0,
    100,
  );

  const metrics: SimulationMetrics = {
    average: Math.round(historicalAverage),
    lastValue,
    trendPercent: totalTrendPercent,
    projectedRangePercent: averageBandWidth,
    anomalyCount: anomalies.length,
    cashGapRisk: Math.round(cashGapRisk),
    confidenceScore: Math.round((trendScore + bandScore + cashGapScore) / 3),
    natwestFitScore,
    liquidityBuffer,
  };

  return {
    forecast,
    anomalies,
    baseline: Math.round(baseline),
    triggers,
    summary: buildSummary(config, metrics, anomalies, triggers, newsImpact),
    insightHeadline: totalTrendPercent >= 0 ? "Growth bias visible" : "Pressure building",
    natwestActionLabel: triggers[0]?.product ?? "Monitor only",
    healthScore,
    newsImpact,
    metrics,
  };
}
