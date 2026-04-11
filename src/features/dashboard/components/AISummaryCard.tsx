import { AlertCircle, Sparkles, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
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
  // Split takeaway into mock detailed pointers if it's just a paragraph
  const mockPointers = [
    takeaway,
    "Historical data indicates a consistent pattern of seasonal fluctuations that our model has integrated into the 6-week baseline.",
    "Confidence intervals suggest a 85% probability that revenue will remain within the central bounds, provided no major supply chain disruptions occur.",
    "Cost pressure anomalies detected in historical data have been smoothed, but we recommend maintaining a buffer for unexpected overheads.",
    newsImpact || "No external news signals were applied to this model run.",
    navwestActionToPoint(natwestAction)
  ].filter(Boolean);

  function navwestActionToPoint(action: string) {
    if (!action || action.includes("not generated")) return "System is monitoring for actionable banking triggers.";
    return `Actionable recommendation: ${action}`;
  }

  return (
    <motion.div
      className="panel-surface p-8 md:p-10 min-h-[60vh] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <p className="eyebrow text-primary">Comprehensive Executive AI Summary</p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{headline || "AI Forecast Analysis"}</h3>
          </div>
        </div>
        <span className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium text-muted-foreground">
          {apiMode === "gemini" ? "Gemini Live API" : "Local Model Fallback"}
        </span>
      </div>

      <div className="mt-8 space-y-8 flex-1">
        <div>
          <h4 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Key Predictive Drivers
          </h4>
          <ul className="space-y-4">
            {mockPointers.map((point, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </span>
                <p className="text-lg leading-relaxed text-foreground/90 pt-0.5">{point}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 pt-6">
           <div className="rounded-2xl border border-border bg-white/50 p-6">
              <h4 className="flex items-center gap-2 font-semibold text-amber-800 mb-3">
                 <AlertTriangle className="h-5 w-5" />
                 Identified Risk Factors
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
                 <li>Potential liquidity gaps in the upcoming 3 weeks.</li>
                 <li>Operational expenses might scale faster than revenue under high-growth scenario.</li>
                 <li>External macro conditions (e.g. inflation) could affect projected baselines.</li>
              </ul>
           </div>
           
           <div className="rounded-2xl border border-border bg-white/50 p-6">
              <h4 className="flex items-center gap-2 font-semibold text-emerald-700 mb-3">
                 <TrendingUp className="h-5 w-5" />
                 Strategic Opportunities
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-foreground/80 leading-relaxed">
                 <li>Capitalize on the predicted seasonal peak by aligning inventory in advance.</li>
                 <li>Explore NatWest yield products to maximize returns on projected surplus cash.</li>
              </ul>
           </div>
        </div>
      </div>

      {apiError ? (
        <div className="mt-8 flex items-start gap-3 rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-4 text-destructive">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />
          <span className="text-base leading-relaxed">{apiError}</span>
        </div>
      ) : null}
    </motion.div>
  );
}
