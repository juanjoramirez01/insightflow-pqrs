import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-card",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptyState({ mensaje }: { mensaje?: string }) {
  return (
    <div className="grid h-[240px] place-items-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
      <div>
        <p className="text-sm font-medium text-foreground">Sin datos para mostrar</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {mensaje ?? "Ajusta o limpia los filtros para ver resultados."}
        </p>
      </div>
    </div>
  );
}