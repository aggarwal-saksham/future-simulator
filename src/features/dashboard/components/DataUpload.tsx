import { useMemo, useState } from "react";
import Papa from "papaparse";
import { ArrowRight, FileText, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataPoint, sampleCsv, sampleData } from "@/lib/sampleData";
import { parseDataset } from "@/lib/forecasting";

interface DataUploadProps {
  data: DataPoint[] | null;
  sourceLabel: string;
  onDataReady: (data: DataPoint[], sourceLabel: string) => void;
}

export function DataUpload({ data, sourceLabel, onDataReady }: DataUploadProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pasteValue, setPasteValue] = useState(sampleCsv);
  const [error, setError] = useState("");

  const latestRows = useMemo(() => data?.slice(-6) ?? sampleData.slice(-6), [data]);

  const handleParsedText = (text: string) => {
    setError("");
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      setError(result.errors[0].message);
      return;
    }

    try {
      onDataReady(parseDataset(result.data), mode === "upload" ? "Uploaded CSV" : "Pasted dataset");
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Could not parse the dataset.");
    }
  };

  return (
    <section id="upload" className="relative px-6 pb-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="panel-surface p-6 md:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Layer 1 · Data Input</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Bring in sales data and start the forecast.
              </h2>
            </div>
            <div className="inline-flex rounded-full border border-border bg-white/75 p-1 shadow-sm">
              <button
                onClick={() => setMode("upload")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Upload CSV
              </button>
              <button
                onClick={() => setMode("paste")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "paste" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Paste Data
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {mode === "upload" ? (
              <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/25 bg-[radial-gradient(circle_at_top,_rgba(94,41,116,0.16),_rgba(255,255,255,0.92)_45%)] p-10 text-center transition hover:border-primary/45">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Drop a CSV or click to browse</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Auto-detects date or week columns plus a value metric. Example headers: `week,sales`
                  or `date,revenue`.
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => handleParsedText(String(reader.result || ""));
                    reader.readAsText(file);
                  }}
                />
              </label>
            ) : (
              <div className="rounded-[28px] border border-border bg-white/70 p-4 shadow-sm">
                <Textarea
                  rows={14}
                  value={pasteValue}
                  onChange={(event) => setPasteValue(event.target.value)}
                  className="min-h-72 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
                />
                <Button onClick={() => handleParsedText(pasteValue)} className="mt-4 rounded-full px-6">
                  Parse dataset
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => onDataReady(sampleData, "Hackathon sample")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Load hackathon sample
              </Button>
              <span className="text-sm text-muted-foreground">
                Demo series includes a clear Week 18 anomaly and a strong post-recovery growth curve.
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="panel-surface p-6 md:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">Preview</p>
              <h3 className="text-xl font-semibold text-foreground">Latest imported rows</h3>
            </div>
          </div>

          <div className="mt-4 rounded-full border border-border bg-white/70 px-4 py-2 text-sm text-muted-foreground">
            Source: {sourceLabel}
          </div>

          <div className="mt-6 grid gap-3">
            {latestRows.map((row) => (
              <div
                key={`${row.label}-${row.value}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{row.label}</span>
                <span className="text-sm text-muted-foreground">GBP {row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-primary/10 bg-primary/[0.05] p-5">
            <p className="eyebrow mb-2">What this unlocks</p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <p>Short-term forecast with central, low, and high cases.</p>
              <p>Historic anomaly detection against local trend behavior.</p>
              <p>NatWest product matching when forecast signals cross key thresholds.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
