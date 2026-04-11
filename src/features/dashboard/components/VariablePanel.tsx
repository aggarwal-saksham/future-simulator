import { Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SimulationConfig } from "@/lib/forecasting";

interface VariablePanelProps {
  config: SimulationConfig;
  onConfigChange: (nextConfig: SimulationConfig) => void;
  onRun: () => void;
  isRunning: boolean;
}

export function VariablePanel({
  config,
  onConfigChange,
  onRun,
  isRunning,
}: VariablePanelProps) {
  const update = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) =>
    onConfigChange({
      ...config,
      [key]: value,
    });

  const renderNumericControl = (
    label: string,
    key: keyof SimulationConfig,
    value: number,
    min: number,
    max: number,
    suffix: string,
    step = 1,
  ) => (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <div className="w-24">
          <Input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) =>
              update(key, Math.max(min, Math.min(max, Number(event.target.value || 0))) as SimulationConfig[typeof key])
            }
            className="h-9 rounded-full bg-white/70 text-right text-foreground/85"
          />
        </div>
      </div>
      <div className="mb-2 text-right text-xs text-muted-foreground">{suffix ? `${value}${suffix}` : value}</div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([nextValue]) => update(key, nextValue as SimulationConfig[typeof key])}
      />
    </div>
  );

  return (
    <div className="panel-surface p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <p className="eyebrow">Step 2 — AI processing core</p>
          <h3 className="text-3xl font-bold text-foreground">Configure Parameters</h3>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {renderNumericControl("Forecast horizon", "horizon", config.horizon, 1, 12, " weeks")}
        {renderNumericControl("Growth assumption", "growthRate", config.growthRate, -20, 30, "%")}
        {renderNumericControl("Cost pressure", "expenseShock", config.expenseShock, 0, 30, "%")}

        <div className="grid gap-4 rounded-[24px] border border-border bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Remove outliers from base trend</Label>
              <p className="text-sm text-muted-foreground">Use cleaner history for the regression slope.</p>
            </div>
            <Switch
              checked={config.removeOutliers}
              onCheckedChange={(value) => update("removeOutliers", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Capex scenario</Label>
              <p className="text-sm text-muted-foreground">Test the effect of an equipment or fit-out investment.</p>
            </div>
            <Switch checked={config.capexPlan} onCheckedChange={(value) => update("capexPlan", value)} />
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
            <div>
              <Label className="text-base font-bold">Include News</Label>
              <p className="text-sm text-muted-foreground">Enable fetching and parsing external news signals.</p>
            </div>
            <Switch checked={config.includeNews} onCheckedChange={(value) => update("includeNews", value)} />
          </div>
        </div>
      </div>

      <Button onClick={onRun} className="mt-6 w-full rounded-full py-6 text-base" disabled={isRunning}>
        {isRunning ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Running forecast
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" />
            Run future simulation
          </span>
        )}
      </Button>
    </div>
  );
}
