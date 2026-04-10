import { RefObject, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, ImageDown, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { DataPoint } from "@/lib/sampleData";
import { SimulationResult } from "@/lib/forecasting";

interface ExportPanelProps {
  data: DataPoint[];
  result: SimulationResult;
  sourceLabel: string;
  reportRef: RefObject<HTMLDivElement>;
}

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const captureReport = async (reportElement: HTMLDivElement) =>
  html2canvas(reportElement, {
    scale: 2,
    backgroundColor: "#fffaf7",
    useCORS: true,
  });

export function ExportPanel({ data, result, sourceLabel, reportRef }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const withReport = async (action: (canvas: HTMLCanvasElement) => Promise<void>) => {
    const reportElement = reportRef.current;

    if (!reportElement) {
      toast({
        title: "Report unavailable",
        description: "The report section is not ready yet.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await captureReport(reportElement);
      await action(canvas);
    } catch (error) {
      console.error("[Export] Report action failed", error);
      toast({
        title: "Export failed",
        description: "Please try the report export again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Future Simulator",
          text: "Future Simulator dashboard",
          url: currentUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast({
        title: "Link copied",
        description: currentUrl,
      });
    } catch (error) {
      console.error("[Share] Link copy failed", error);
      toast({
        title: "Share failed",
        description: "Could not copy the current page URL.",
      });
    }
  };

  const handlePrint = async () => {
    await withReport(async (canvas) => {
      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank", "width=1200,height=900");

      if (!printWindow) {
        throw new Error("Print popup blocked");
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Future Simulator Report</title>
            <style>
              body { margin: 0; padding: 24px; font-family: Arial, sans-serif; background: #fffaf7; }
              img { width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Future Simulator report" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
  };

  return (
    <div className="panel-surface p-6">
      <p className="eyebrow mb-2">Export</p>
      <h3 className="text-xl font-semibold text-foreground/90">Download or share the simulation</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {[
          { label: "Source", value: sourceLabel },
          { label: "Rows", value: data.length },
          { label: "Triggers", value: result.triggers.length },
          { label: "Health", value: result.healthScore },
        ].map((item) => (
          <div key={item.label} className="rounded-[24px] border border-border bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-foreground/85">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() =>
            downloadFile(
              "future-simulator-result.json",
              JSON.stringify({ input: data, sourceLabel, result }, null, 2),
              "application/json",
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() =>
            downloadFile(
              "future-simulator-forecast.csv",
              ["week,low,central,high,baseline", ...result.forecast.map((point) =>
                `${point.label},${point.low},${point.central},${point.high},${point.baseline}`,
              )].join("\n"),
              "text/csv;charset=utf-8",
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="secondary"
          className="rounded-full"
          disabled={isExporting}
          onClick={() =>
            withReport(async (canvas) => {
              const pdf = new jsPDF("p", "mm", "a4");
              const width = pdf.internal.pageSize.getWidth();
              const height = (canvas.height * width) / canvas.width;
              pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
              pdf.save("future-simulator-report.pdf");
            })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          PDF Report
        </Button>
        <Button
          variant="secondary"
          className="rounded-full"
          disabled={isExporting}
          onClick={() =>
            withReport(async (canvas) => {
              const anchor = document.createElement("a");
              anchor.href = canvas.toDataURL("image/png");
              anchor.download = "future-simulator-report.png";
              anchor.click();
            })
          }
        >
          <ImageDown className="mr-2 h-4 w-4" />
          PNG Report
        </Button>
        <Button variant="secondary" className="rounded-full" onClick={handleCopyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Copy page link
        </Button>
        <Button variant="secondary" className="rounded-full" disabled={isExporting} onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print report
        </Button>
      </div>
    </div>
  );
}
