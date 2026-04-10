import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-24 md:pt-28">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />

      <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4" />
            NatWest Hackathon 2026 · Forecasting
          </motion.span>

          <motion.h1
            className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-primary-foreground md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Forecast the next six weeks
            <span className="block text-primary-foreground/70">and match the right banking move.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/78 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            Upload operating data, layer in external news pressure, run scenario simulations, and surface the
            NatWest product that fits the risk signal before the cash event actually hits.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="rounded-full bg-white px-7 text-primary hover:bg-white/90"
            >
              Start simulation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-primary-foreground/68">
              Fully functional offline. Optional Claude and NewsAPI hooks when keys are present.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 panel-dark p-6 md:p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Honest ranges",
                text: "Forecasts show low, central, and high cases instead of one overconfident number.",
              },
              {
                icon: ShieldCheck,
                title: "Explainable outputs",
                text: "Baseline, anomalies, news impact, and triggers are all visible in one dashboard.",
              },
              {
                icon: Sparkles,
                title: "Actionable banking",
                text: "Recommendations are tied to the simulated signal, not shown as generic ads.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <item.icon className="h-5 w-5 text-primary-foreground" />
                <h2 className="mt-4 text-lg font-semibold text-primary-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/70">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/8 p-5">
              <p className="eyebrow text-primary-foreground/65">Performance</p>
              <p className="mt-2 text-3xl font-semibold text-primary-foreground">&lt; 30s</p>
              <p className="mt-2 text-sm text-primary-foreground/70">From upload to result for the core simulation.</p>
            </div>
            <div className="rounded-[24px] bg-white/8 p-5">
              <p className="eyebrow text-primary-foreground/65">For SMEs</p>
              <p className="mt-2 text-3xl font-semibold text-primary-foreground">5 to 200</p>
              <p className="mt-2 text-sm text-primary-foreground/70">Built for business owners and finance leads, not data scientists.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
