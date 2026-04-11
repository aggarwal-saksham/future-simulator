import { useMemo, useState } from "react";
import { ArrowRight, Building2, TrendingUp, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trigger } from "@/lib/forecasting";

interface NatWestCardProps {
  triggers: Trigger[];
}

export function NatWestCard({ triggers }: NatWestCardProps) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visibleTriggers = triggers.filter((_, index) => !dismissed.includes(index));

  const summary = useMemo(
    () => ({
      total: triggers.length,
      high: triggers.filter((item) => item.severity === "high").length,
      medium: triggers.filter((item) => item.severity === "medium").length,
      low: triggers.filter((item) => item.severity === "low").length,
    }),
    [triggers],
  );

  if (visibleTriggers.length === 0) {
    return (
      <div className="panel-surface p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Step 5 — NatWest banking intelligence</p>
            <h3 className="text-xl font-semibold text-foreground">No active product trigger</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Triggered", value: summary.total },
          { label: "High", value: summary.high },
          { label: "Medium", value: summary.medium },
          { label: "Low", value: summary.low },
        ].map((item) => (
          <div key={item.label} className="panel-surface p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {visibleTriggers.map((trigger, index) => (
        <motion.div
          key={`${trigger.type}-${index}`}
          className="relative overflow-hidden rounded-[32px] border border-primary/15 bg-[linear-gradient(135deg,rgba(94,41,116,0.96),rgba(132,66,150,0.92),rgba(250,244,238,0.92))] p-[1px] shadow-[0_24px_80px_rgba(55,28,70,0.16)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.08 }}
        >
          <div className="rounded-[31px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_rgba(255,249,244,0.96)_38%,_rgba(255,255,255,0.92)_100%)] p-6 md:p-8">
            <button
              onClick={() =>
                setDismissed((current) => [...current, triggers.findIndex((item) => item === trigger)])
              }
              className="absolute right-6 top-6 rounded-full bg-white/70 p-2 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="eyebrow mb-2">Step 5 — NatWest banking intelligence</p>
                <h3 className="text-2xl font-semibold text-foreground">{trigger.product}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                    {trigger.type.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {trigger.severity} priority
                  </span>
                </div>
              </div>
              <div className="rounded-[24px] border border-border bg-white/75 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Actionable signal
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{trigger.signal}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Object.entries(trigger.prefillData).map(([key, value]) => (
                <div key={key} className="rounded-[24px] border border-border bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] border border-border bg-white/70 px-4 py-3 text-sm text-foreground/80">
              <strong className="mr-2 text-foreground/90">Why this surfaced:</strong>
              {trigger.explanation}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button className="rounded-full px-6">
                Review pre-filled application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
