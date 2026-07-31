import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  /** true cuando subir es malo (p.ej. PQRS totales) */
  invertido?: boolean;
  hint?: string;
}

export function KpiCard({ label, value, delta, icon: Icon, invertido, hint }: Props) {
  const sube = delta > 0;
  const plano = Math.abs(delta) < 0.05;
  const bueno = plano ? null : invertido ? !sube : sube;
  const TrendIcon = plano ? Minus : sube ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            bueno === null && "bg-muted text-muted-foreground",
            bueno === true && "bg-success/12 text-success",
            bueno === false && "bg-critical/12 text-critical",
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {plano ? "Estable" : `${sube ? "+" : ""}${delta}%`}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {hint ?? "vs. periodo anterior"}
        </span>
      </div>
    </div>
  );
}