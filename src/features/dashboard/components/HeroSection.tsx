import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-20 md:pt-24">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />

      <div className="mx-auto grid max-w-7xl items-end gap-8 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative z-10">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4" />
            Forecasting workspace
          </motion.span>

          <motion.h1
            className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.97] tracking-tight text-primary-foreground md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Forecast the next six weeks.
            <span className="block text-primary-foreground/72">See the signal before it becomes a problem.</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-base leading-7 text-primary-foreground/76 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            Upload operating data, adjust a few assumptions, and get a faster view of risk, confidence, and next
            steps.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="rounded-full bg-white px-7 text-primary hover:bg-white/90"
            >
              Start
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 panel-dark p-5 md:p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Ranges",
                text: "Low, central, and high cases in one view.",
              },
              {
                icon: ShieldCheck,
                title: "Signals",
                text: "Key risk signals surfaced without extra noise.",
              },
              {
                icon: Sparkles,
                title: "Actions",
                text: "A concise next-step summary when the run completes.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                <item.icon className="h-5 w-5 text-primary-foreground" />
                <h2 className="mt-3 text-base font-semibold text-primary-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/68">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] bg-white/6 p-4">
            <p className="text-sm leading-6 text-primary-foreground/72">
              A lighter forecasting dashboard for quick scenario checks.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
