import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { DrilldownCausas } from "@/components/dashboard/DrilldownCausas";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import { TooltipBox } from "@/components/charts/ChartTooltip";
import { useFiltros } from "@/lib/pqrs-filters";
import { CHART_COLORS, contarPor, construirStackedPorSubcausa } from "@/lib/pqrs-metrics";

export const Route = createFileRoute("/causas")({
  head: () => ({
    meta: [
      { title: "Análisis de causas raíz PQRS | Drill-down jerárquico" },
      {
        name: "description",
        content:
          "Explora la jerarquía Causa principal → Subcausa → Detalle de las PQRS con navegación interactiva.",
      },
      { property: "og:title", content: "Análisis de causas raíz PQRS" },
      {
        property: "og:description",
        content: "Drill-down interactivo de causas, subcausas y detalles de PQRS.",
      },
    ],
  }),
  component: CausasPage,
});

function CausasPage() {
  const { data, taxonomia } = useFiltros();
  const total = data.length;
  const porDetalle = useMemo(() => contarPor(data, "detalle").slice(0, 10), [data]);
  const stackedSubcausa = useMemo(() => construirStackedPorSubcausa(data), [data]);
  // Con muchas subcausas se prefiere comprimir el alto de cada fila antes que
  // alargar la página indefinidamente (aquí no se puede hacer scroll interno
  // sin que la leyenda, que va al fondo del propio gráfico, quede oculta).
  const alturaStacked = Math.min(560, Math.max(220, stackedSubcausa.rows.length * 60));

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Análisis de causas raíz"
        subtitle="Identifica el origen real de las PQRS recorriendo la jerarquía Causa → Subcausa → Detalle"
      >
        <div className="lg:max-w-md">
          <DemoNotice />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <FiltersPanel />
        {total === 0 ? (
          <EmptyState mensaje="Ninguna PQRS coincide con la combinación de filtros seleccionada." />
        ) : (
          <>
            <DrilldownCausas data={data} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <ChartCard
                title="Top 10 de detalles"
                description="Detalles con mayor frecuencia dentro del conjunto filtrado"
              >
                <ol className="space-y-2">
                  {porDetalle.map((d, i) => (
                    <li
                      key={d.name}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-secondary/60"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0 truncate text-sm">{d.name}</span>
                      <span className="shrink-0 text-sm font-semibold">{d.value}</span>
                    </li>
                  ))}
                </ol>
              </ChartCard>

              <ChartCard
                title="Estructura de clasificación"
                description="Árbol de causas, subcausas y detalles válidos. Nunca se permiten combinaciones inválidas."
              >
                <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                  {Object.entries(taxonomia).map(([causa, subs]) => (
                    <div key={causa}>
                      <p className="text-sm font-semibold text-foreground">{causa}</p>
                      <ul className="mt-2 space-y-2 border-l border-border pl-3">
                        {Object.entries(subs).map(([sub, dets]) => (
                          <li key={sub}>
                            <p className="text-xs font-medium text-primary">{sub}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                              {dets.join(" · ")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            <ChartCard
              title="Detalle asociado por subcausa"
              description="Composición de los detalles operativos (top 8) dentro de cada subcausa"
            >
              {stackedSubcausa.rows.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="w-full" style={{ height: alturaStacked + 70 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stackedSubcausa.rows}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid horizontal={false} stroke="var(--border)" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="subcausa"
                        width={190}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                      <Legend
                        verticalAlign="bottom"
                        height={64}
                        formatter={(v: string) => (
                          <span className="text-xs text-muted-foreground">
                            {v.length > 36 ? `${v.slice(0, 35)}…` : v}
                          </span>
                        )}
                      />
                      {stackedSubcausa.keys.map((key, i) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId="detalle"
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          radius={i === stackedSubcausa.keys.length - 1 ? [0, 6, 6, 0] : undefined}
                          animationDuration={300}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
