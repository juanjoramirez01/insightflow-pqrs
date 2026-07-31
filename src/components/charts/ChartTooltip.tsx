import type { TooltipProps } from "recharts";

export function TooltipBox({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="max-w-[220px] font-medium text-popover-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-1 text-muted-foreground">
          <span className="font-semibold text-foreground">{p.value}</span> PQRS
          {p.name && p.name !== "value" ? ` · ${p.name}` : ""}
        </p>
      ))}
    </div>
  );
}