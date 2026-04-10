import { Globe2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsSignal, SimulationConfig } from "@/lib/forecasting";

interface NewsToggleProps {
  config: SimulationConfig;
  newsSignals: NewsSignal[];
  isLoading: boolean;
  lastSyncedAt: string | null;
  onRefresh: () => void;
  onToggleSignal: (id: string) => void;
}

export function NewsToggle({
  config,
  newsSignals,
  isLoading,
  lastSyncedAt,
  onRefresh,
  onToggleSignal,
}: NewsToggleProps) {
  return (
    <div className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Layer 3 · External Signals</p>
            <h3 className="text-xl font-semibold text-foreground">News context weighting</h3>
          </div>
        </div>
        <Button variant="secondary" className="rounded-full" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh signals
        </Button>
      </div>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        Select the headlines that should influence demand, supply, FX, or cost assumptions in this run.
        When no API key is set, the app uses demo signals so the experience stays fully functional offline.
      </p>

      <div className="mt-4 rounded-full border border-border bg-white/70 px-4 py-2 text-xs text-muted-foreground">
        Last sync: {lastSyncedAt ?? "Not fetched yet"}
      </div>

      <div className="mt-6 grid gap-4">
        {newsSignals.map((signal) => {
          const selected = config.selectedNewsIds.includes(signal.id);
          const tone =
            signal.impact >= 0
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
              : "border-amber-200 bg-amber-50/70 text-amber-800";

          return (
            <button
              key={signal.id}
              onClick={() => onToggleSignal(signal.id)}
              className={`rounded-[24px] border p-4 text-left transition ${
                selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                      {signal.source}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
                      {signal.impact > 0 ? "+" : ""}
                      {signal.impact}% {signal.category}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-foreground">{signal.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.summary}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selected && config.includeNews ? "Applied" : "Optional"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
