import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LineChart } from "lucide-react";
import { AISummaryCard } from "@/features/dashboard/components/AISummaryCard";
import { DashboardInsights } from "@/features/dashboard/components/DashboardInsights";
import { DataUpload } from "@/features/dashboard/components/DataUpload";
import { ExportPanel } from "@/features/dashboard/components/ExportPanel";
import { ForecastChart } from "@/features/dashboard/components/ForecastChart";
import { HeroSection } from "@/features/dashboard/components/HeroSection";
import { ModelTrainingScreen } from "@/features/dashboard/components/ModelTrainingScreen";
import { NatWestCard } from "@/features/dashboard/components/NatWestCard";
import { NewsToggle } from "@/features/dashboard/components/NewsToggle";
import { ScenarioCompare } from "@/features/dashboard/components/ScenarioCompare";
import { VariablePanel } from "@/features/dashboard/components/VariablePanel";
import {
  baselineSimulationConfig,
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

const GEMINI_COOLDOWN_MS = 65_000;

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
  const [newsError, setNewsError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [lastNewsSyncAt, setLastNewsSyncAt] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [resultMode, setResultMode] = useState<"main" | "detailed" | "ai" | "natwest">("main");
  const reportRef = useRef<HTMLDivElement>(null);
  const lastGeminiAttemptRef = useRef(0);

  const selectedData = data ?? sampleData;

  const loadNews = async () => {
    setNewsLoading(true);
    const newsResult = await fetchNewsSignals();
    setNewsSignals(newsResult.signals);
    setNewsError(newsResult.error);
    setConfig((current) => ({
      ...current,
      selectedNewsIds: newsResult.signals.filter((signal) => signal.selected).map((signal) => signal.id),
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
      let enhancedInsight = null;
      let geminiError: string | null = null;
      const shouldCallGemini =
        Boolean(import.meta.env.VITE_GEMINI_API_KEY) &&
        Date.now() - lastGeminiAttemptRef.current >= GEMINI_COOLDOWN_MS;

      if (shouldCallGemini) {
        lastGeminiAttemptRef.current = Date.now();
        const geminiResult = await enhanceSummaryWithGemini(selectedData, localResult);
        enhancedInsight = geminiResult.insight;
        geminiError = geminiResult.error;
      } else if (import.meta.env.VITE_GEMINI_API_KEY) {
        geminiError = "Gemini is cooling down to avoid rate limits. Using the local summary for this run.";
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1800));

      let nextResult = localResult;

      if (enhancedInsight) {
        nextResult = {
          ...localResult,
          summary: enhancedInsight.takeaway,
          insightHeadline: enhancedInsight.headline,
          natwestActionLabel: enhancedInsight.natwestAction,
        };
        setApiMode("gemini");
      } else {
        setApiMode("fallback");
        setApiError(geminiError);
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 2600) {
        await new Promise((resolve) => window.setTimeout(resolve, 2600 - elapsed));
      }

      setRunProgress(100);
      setResult(nextResult);
      setBaselineResult(localBaseline);
      setLastRunAt(new Date().toLocaleString("en-GB"));
      setWizardStep(3);
      setResultMode("main");
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setIsRunning(false);
        setRunProgress(0);
      }, 220);
    }
  }, [config, newsSignals, selectedData, sourceLabel]);

  const hasResult = Boolean(data && result);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(52,25,65,0.72)] backdrop-blur-lg">
          <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                FS
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">Future Simulator</p>
                <p className="text-sm text-white/72">Scenario forecasting</p>
              </div>
            </div>
          </div>
        </nav>

        {wizardStep === 1 && (
          <>
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
                setWizardStep(2);
              }}
            />
          </>
        )}

        {wizardStep === 2 && (
          <section className="px-6 pb-24 pt-8">
            <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 items-start gap-6">
              <VariablePanel config={config} onConfigChange={setConfig} onRun={() => { setWizardStep(3); runSimulation(); }} isRunning={isRunning} />
              {config.includeNews && (
                <NewsToggle
                  config={config}
                  newsSignals={newsSignals}
                  isLoading={newsLoading}
                  lastSyncedAt={lastNewsSyncAt}
                  error={newsError}
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
              )}
            </div>
          </section>
        )}

        {wizardStep === 3 && (
          <section className="px-6 pb-24 pt-8">
            <div className="mx-auto max-w-5xl space-y-6">
              {isRunning ? (
                <ModelTrainingScreen progress={runProgress} />
              ) : result ? (
                <div ref={reportRef} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="rounded-xl bg-primary/12 px-4 py-2 text-2xl font-bold text-primary-foreground">
                      ML model predictions
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => setResultMode("main")}
                        variant={resultMode === "main" ? "default" : "outline"}
                      >
                        Main View
                      </Button>
                      <Button
                        onClick={() => setResultMode("detailed")}
                        variant={resultMode === "detailed" ? "default" : "outline"}
                      >
                        Detailed Report
                      </Button>
                      <Button
                        onClick={() => setResultMode("ai")}
                        variant={resultMode === "ai" ? "default" : "outline"}
                      >
                        AI Summary
                      </Button>
                      <Button
                        onClick={() => setResultMode("natwest")}
                        variant={resultMode === "natwest" ? "default" : "outline"}
                      >
                        How NatWest Can Help
                      </Button>
                    </div>
                  </div>

                  {(resultMode === "main" || resultMode === "detailed") && (
                    <ForecastChart
                      historicalData={selectedData}
                      forecast={result.forecast}
                      anomalies={result.anomalies}
                    />
                  )}

                  {resultMode === "detailed" && (
                    <>
                      <ScenarioCompare baselineResult={baselineResult} scenarioResult={result} />
                      <br/>
                      <DashboardInsights result={result} />
                    </>
                  )}

                  {resultMode === "ai" && (
                     <AISummaryCard
                        headline={result.insightHeadline}
                        takeaway={result.summary}
                        natwestAction={result.natwestActionLabel}
                        newsImpact={result.newsImpact}
                        apiMode={apiMode}
                        apiError={apiError}
                     />
                  )}

                  {resultMode === "natwest" && (
                     <NatWestCard triggers={result.triggers} />
                  )}

                  <ExportPanel
                    data={selectedData}
                    result={result}
                    sourceLabel={sourceLabel}
                    reportRef={reportRef}
                  />
                  <Button onClick={() => setWizardStep(2)} variant="secondary" className="w-full">
                    Go Back to Steps
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default FutureSimulatorPage;
