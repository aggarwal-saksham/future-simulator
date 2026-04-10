import { AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AISummaryCardProps {
  headline: string;
  takeaway: string;
  natwestAction: string;
  newsImpact: string;
  apiMode: "gemini" | "fallback";
  apiError: string | null;
}

export function AISummaryCard({
  headline,
  takeaway,
  natwestAction,
  newsImpact,
  apiMode,
  apiError,
}: AISummaryCardProps) {
  const items = [
    { label: "Signal", value: headline },
    { label: "Takeaway", value: takeaway },
    { label: "NatWest", value: natwestAction },
  ];

  return (
    <motion.div
      className="panel-surface p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">AI Insight</p>
            <h3 className="text-xl font-semibold text-foreground">Compact model output</h3>
          </div>
        </div>
        <span className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          {apiMode === "gemini" ? "Gemini live" : "Local fallback"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-border bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
        {newsImpact}
      </div>

      {apiError ? (
        <div className="mt-4 flex items-start gap-2 rounded-[24px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{apiError}</span>
        </div>
      ) : null}
    </motion.div>
  );
}
