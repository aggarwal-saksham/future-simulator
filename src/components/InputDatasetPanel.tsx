import { Database, FileSpreadsheet } from "lucide-react";
import { DataPoint } from "@/lib/sampleData";

interface InputDatasetPanelProps {
  data: DataPoint[];
  sourceLabel: string;
}

export function InputDatasetPanel({ data, sourceLabel }: InputDatasetPanelProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const average = data.length > 0 ? Math.round(total / data.length) : 0;
  const values = data.map((point) => point.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;

  return (
    <div className="panel-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Dataset Transparency</p>
            <h3 className="text-xl font-semibold text-foreground/90">Active input dataset</h3>
          </div>
        </div>
        <span className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          {sourceLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          { label: "Rows", value: data.length },
          { label: "Average", value: `£${average.toLocaleString()}` },
          { label: "Max", value: `£${maxValue.toLocaleString()}` },
          { label: "Min", value: `£${minValue.toLocaleString()}` },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-border bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground/85">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-border bg-white/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          Visible input rows used by the forecast
        </div>
        <div className="max-h-72 overflow-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Label</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={`${row.label}-${row.value}`} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground/85">{row.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">£{row.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
