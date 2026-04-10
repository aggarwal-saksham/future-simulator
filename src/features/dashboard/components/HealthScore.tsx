import { motion } from "framer-motion";

interface HealthScoreProps {
  score: number;
}

export function HealthScore({ score }: HealthScoreProps) {
  const status =
    score >= 75
      ? { label: "Healthy", tone: "text-emerald-700", bg: "bg-emerald-50", stroke: "#15803d" }
      : score >= 50
        ? { label: "Stretched", tone: "text-amber-700", bg: "bg-amber-50", stroke: "#d97706" }
        : { label: "At Risk", tone: "text-rose-700", bg: "bg-rose-50", stroke: "#e11d48" };

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="panel-surface flex flex-col items-center p-6"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
    >
      <p className="eyebrow self-start">Health Score</p>
      <h3 className="self-start text-xl font-semibold text-foreground">Financial resilience</h3>

      <div className="relative mt-6 h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(82, 55, 97, 0.10)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={status.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-foreground">{score}</span>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">out of 100</span>
        </div>
      </div>

      <span className={`mt-4 rounded-full px-4 py-2 text-sm font-medium ${status.bg} ${status.tone}`}>
        {status.label}
      </span>
    </motion.div>
  );
}
