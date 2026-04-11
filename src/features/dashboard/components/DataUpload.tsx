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
      <div className="mx-auto max-w-2xl">
        <motion.div
          className="panel-surface p-6 md:p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Step 1 — Data input</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Select dataset
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
                Load sample
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
