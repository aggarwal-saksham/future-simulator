import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LineChart } from "lucide-react";
import { AISummaryCard } from "@/features/dashboard/components/AISummaryCard";
import { DashboardInsights } from "@/features/dashboard/components/DashboardInsights";
import { DataUpload } from "@/features/dashboard/components/DataUpload";
import { ExportPanel } from "@/features/dashboard/components/ExportPanel";
import { ForecastChart } from "@/features/dashboard/components/ForecastChart";
import { HealthScore } from "@/features/dashboard/components/HealthScore";
import { HeroSection } from "@/features/dashboard/components/HeroSection";
import { InputDatasetPanel } from "@/features/dashboard/components/InputDatasetPanel";
import { ModelTrainingScreen } from "@/features/dashboard/components/ModelTrainingScreen";
import { NatWestCard } from "@/features/dashboard/components/NatWestCard";
import { NewsToggle } from "@/features/dashboard/components/NewsToggle";
import { ScenarioCompare } from "@/features/dashboard/components/ScenarioCompare";
import { VariablePanel } from "@/features/dashboard/components/VariablePanel";
import {
  baselineSimulationConfig,
  dashboardMetricCards,
  defaultSimulationConfig,
} from "@/features/dashboard/config";
import { Button } from "@/components/ui/button";
import { fetchNewsSignals, enhanceSummaryWithGemini } from "@/services/api";
import {
  CURATED_NEWS_SIGNALS,
  NewsSignal,
  SimulationConfig,
  SimulationResult,
  generateSimulation,
} from "@/lib/forecasting";
import { DataPoint, sampleData } from "@/lib/sampleData";

const FutureSimulatorPage = () => {
  const [data, setData] = useState<DataPoint[] | null>(sampleData);
  const [sourceLabel, setSourceLabel] = useState("Hackathon sample");
  const [config, setConfig] = useState<SimulationConfig>(defaultSimulationConfig);
  const [newsSignals, setNewsSignals] = useState<NewsSignal[]>(CURATED_NEWS_SIGNALS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [apiMode, setApiMode] = useState<"gemini" | "fallback">("fallback");
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [lastNewsSyncAt, setLastNewsSyncAt] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const hasAutoRunRef = useRef(false);

  const selectedData = data ?? sampleData;

  const loadNews = async () => {
    setNewsLoading(true);
    const signals = await fetchNewsSignals();
    setNewsSignals(signals);
    setConfig((current) => ({
      ...current,
      selectedNewsIds: signals.filter((signal) => signal.selected).map((signal) => signal.id),
    }));
    setLastNewsSyncAt(new Date().toLocaleString("en-GB"));
    setNewsLoading(false);
  };

  useEffect(() => {
    void loadNews();
  }, []);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setRunProgress(8);
    setApiMode("fallback");
    setApiError(null);

    console.groupCollapsed("[Simulation] Starting run");
    console.log("Source label", sourceLabel);
    console.log("Input data", selectedData);
    console.log("Config", config);
    console.log("News signals", newsSignals);
    console.groupEnd();

    const startTime = Date.now();
    let progress = 8;
    const progressTimer = window.setInterval(() => {
      progress = Math.min(progress + 11, 92);
      setRunProgress(progress);
    }, 240);

    const localResult = generateSimulation(selectedData, config, newsSignals);
    const localBaseline = generateSimulation(selectedData, baselineSimulationConfig, newsSignals);

    console.groupCollapsed("[Simulation] Local forecast results");
    console.log("Scenario result", localResult);
    console.log("Baseline result", localBaseline);
    console.groupEnd();

    try {
      const [enhancedInsight] = await Promise.all([
        enhanceSummaryWithGemini(selectedData, localResult),
        new Promise((resolve) => window.setTimeout(resolve, 1800)),
      ]);

      let nextResult = localResult;

      if (enhancedInsight) {
        nextResult = {
          ...localResult,
          summary: enhancedInsight.takeaway,
          insightHeadline: enhancedInsight.headline,
          natwestActionLabel: enhancedInsight.natwestAction,
        };
        setApiMode("gemini");
      } else if (import.meta.env.VITE_GEMINI_API_KEY) {
        setApiError("Gemini did not return a valid dashboard insight. Local fallback is shown instead.");
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 2600) {
        await new Promise((resolve) => window.setTimeout(resolve, 2600 - elapsed));
      }

      setRunProgress(100);
      setResult(nextResult);
      setBaselineResult(localBaseline);
      setLastRunAt(new Date().toLocaleString("en-GB"));
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setIsRunning(false);
        setRunProgress(0);
      }, 220);
    }
  }, [config, newsSignals, selectedData, sourceLabel]);

  useEffect(() => {
    if (hasAutoRunRef.current) {
      return;
    }
    hasAutoRunRef.current = true;
    void runSimulation();
  }, [runSimulation]);

  const hasResult = Boolean(data && result);

  const pageLink = useMemo(
    () => `${window.location.origin}${window.location.pathname}`,
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(52,25,65,0.84)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-sm font-semibold text-white shadow-lg">
                FS
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Future Simulator</p>
                <p className="text-sm text-white/78">NatWest forecasting prototype</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">
                {selectedData.length} data points
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">
                API: {apiMode === "gemini" ? "Gemini" : "Local"}
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">
                Last run: {lastRunAt ?? "pending"}
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">
                Link: {pageLink}
              </span>
            </div>
          </div>
        </nav>

        <HeroSection
          onGetStarted={() =>
            document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />

        <DataUpload
          data={data}
          sourceLabel={sourceLabel}
          onDataReady={(nextData, nextSourceLabel) => {
            setData(nextData);
            setSourceLabel(nextSourceLabel);
            setResult(null);
            setBaselineResult(null);
          }}
        />

        <section className="px-6 pb-24 pt-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-6">
              <VariablePanel config={config} onConfigChange={setConfig} onRun={runSimulation} isRunning={isRunning} />
              <NewsToggle
                config={config}
                newsSignals={newsSignals}
                isLoading={newsLoading}
                lastSyncedAt={lastNewsSyncAt}
                onRefresh={loadNews}
                onToggleSignal={(id) =>
                  setConfig((current) => ({
                    ...current,
                    selectedNewsIds: current.selectedNewsIds.includes(id)
                      ? current.selectedNewsIds.filter((currentId) => currentId !== id)
                      : [...current.selectedNewsIds, id],
                  }))
                }
              />
              <InputDatasetPanel data={selectedData} sourceLabel={sourceLabel} />
              {result ? <HealthScore score={result.healthScore} /> : null}
            </div>

            <div className="space-y-6">
              {isRunning ? (
                <ModelTrainingScreen progress={runProgress} />
              ) : !hasResult ? (
                <motion.div
                  className="panel-surface flex min-h-[420px] flex-col items-center justify-center p-10 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="rounded-3xl bg-primary/10 p-5 text-primary">
                    <LineChart className="h-10 w-10" />
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold text-foreground">Run the first simulation</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                    Upload a CSV or use the sample dataset, tune the scenario controls, and run the forecast to
                    generate anomalies, health scoring, NatWest product triggers, and exportable output.
                  </p>
                  <Button className="mt-6 rounded-full px-6" onClick={runSimulation}>
                    Generate forecast
                  </Button>
                </motion.div>
              ) : result ? (
                <div ref={reportRef} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-5">
                    {dashboardMetricCards.map((metric) => (
                      <div key={metric.label} className="panel-surface p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <metric.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className={`mt-4 text-3xl font-semibold ${metric.getTone(result)}`}>
                          {metric.getValue(result)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <ForecastChart historicalData={selectedData} forecast={result.forecast} anomalies={result.anomalies} />
                  <DashboardInsights result={result} />
                  <ScenarioCompare baselineResult={baselineResult} scenarioResult={result} />
                  <AISummaryCard
                    headline={result.insightHeadline}
                    takeaway={result.summary}
                    natwestAction={result.natwestActionLabel}
                    newsImpact={result.newsImpact}
                    apiMode={apiMode}
                    apiError={apiError}
                  />
                  <NatWestCard triggers={result.triggers} />
                </div>
              ) : null}

              {result && !isRunning ? (
                <>
                  <ExportPanel
                    data={selectedData}
                    result={result}
                    sourceLabel={sourceLabel}
                    reportRef={reportRef}
                  />
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FutureSimulatorPage;
