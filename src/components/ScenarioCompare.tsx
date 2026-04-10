import { BarChart3 } from "lucide-react";
import { SimulationResult } from "@/lib/forecasting";

interface ScenarioCompareProps {
  baselineResult: SimulationResult | null;
  scenarioResult: SimulationResult | null;
}

export function ScenarioCompare({ baselineResult, scenarioResult }: ScenarioCompareProps) {
  if (!baselineResult || !scenarioResult) {
    return null;
  }

  const baseEnd = baselineResult.forecast.at(-1)?.central ?? 0;
  const scenarioEnd = scenarioResult.forecast.at(-1)?.central ?? 0;
  const delta = scenarioEnd - baseEnd;
  const healthDelta = scenarioResult.healthScore - baselineResult.healthScore;
  const riskDelta = scenarioResult.metrics.cashGapRisk - baselineResult.metrics.cashGapRisk;

  return (
    <div className="panel-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="eyebrow">Scenario Compare</p>
          <h3 className="text-xl font-semibold text-foreground">How the scenario changes the outlook</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">End-of-horizon central case</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">£{scenarioEnd.toLocaleString()}</p>
          <p className={`mt-2 text-sm ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {delta >= 0 ? "+" : ""}£{delta.toLocaleString()} vs baseline
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">Health score impact</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{scenarioResult.healthScore}</p>
          <p className={`mt-2 text-sm ${healthDelta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {healthDelta >= 0 ? "+" : ""}
            {healthDelta} points vs baseline
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">Cash gap risk</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{scenarioResult.metrics.cashGapRisk}%</p>
          <p className={`mt-2 text-sm ${riskDelta <= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {riskDelta > 0 ? "+" : ""}
            {riskDelta}% vs baseline
          </p>
        </div>
      </div>
    </div>
  );
}
