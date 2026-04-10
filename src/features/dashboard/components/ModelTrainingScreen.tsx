import { BrainCircuit, DatabaseZap, LineChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ModelTrainingScreenProps {
  progress: number;
}

const stages = [
  { threshold: 24, label: "Normalizing uploaded rows", icon: DatabaseZap },
  { threshold: 62, label: "Running forecast layers", icon: BrainCircuit },
  { threshold: 100, label: "Generating NatWest actions", icon: LineChart },
];

export function ModelTrainingScreen({ progress }: ModelTrainingScreenProps) {
  const stage = stages.find((item) => progress <= item.threshold) ?? stages[stages.length - 1];

  return (
    <div className="panel-surface flex min-h-[540px] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-3xl bg-primary/10 p-5 text-primary">
        <stage.icon className="h-10 w-10 animate-pulse" />
      </div>
      <p className="eyebrow mt-6">Model Run In Progress</p>
      <h2 className="mt-3 text-3xl font-semibold text-foreground/90">Future Simulator is processing</h2>
      <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
        Upload data, scenario variables, and external signals are being combined into a forecast and NatWest action set.
      </p>
      <div className="mt-8 w-full max-w-xl">
        <Progress value={progress} className="h-3 bg-primary/10" />
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{stage.label}</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
