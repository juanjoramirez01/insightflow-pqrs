import {
  ClipboardList,
  Filter,
  LineChart,
  Search,
  Lightbulb,
  ListChecks,
  Repeat,
  ChevronRight,
} from "lucide-react";

const PASOS = [
  { icon: ClipboardList, t: "PQRS", d: "Registro de la solicitud del usuario" },
  { icon: Filter, t: "Clasificación", d: "Causa, subcausa y detalle" },
  { icon: LineChart, t: "Análisis", d: "Indicadores y comparativos" },
  { icon: Search, t: "Causa raíz", d: "Identificación del origen real" },
  { icon: Lightbulb, t: "Oportunidad de mejora", d: "Hallazgo accionable" },
  { icon: ListChecks, t: "Plan de acción", d: "Responsables y fechas" },
  { icon: Repeat, t: "Seguimiento", d: "Verificación del impacto" },
];

export function ValueFlow() {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold">Flujo de valor</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        De la información operativa a decisiones de mejora continua.
      </p>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {PASOS.map((p, i) => (
          <div key={p.t} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:border-accent hover:bg-accent/8">
              <p.icon className="h-4 w-4 text-accent" />
              <p className="mt-2 truncate text-xs font-semibold text-foreground">{p.t}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{p.d}</p>
            </div>
            {i < PASOS.length - 1 ? (
              <ChevronRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground lg:rotate-0" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}