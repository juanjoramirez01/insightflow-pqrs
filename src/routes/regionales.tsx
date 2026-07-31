import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import { TooltipBox } from "@/components/charts/ChartTooltip";
import { useFiltros } from "@/lib/pqrs-filters";
import { CHART_COLORS, contarPor } from "@/lib/pqrs-metrics";
import { REGIONALES } from "@/data/pqrs";

export const Route = createFileRoute("/regionales")({
  head: () => ({
    meta: [
      { title: "PQRS por regional | Comparativo territorial" },
      {
        name: "description",
        content:
          "Comparativo de PQRS entre regionales: volumen, causa predominante y tiempo promedio de gestión.",
      },
      { property: "og:title", content: "PQRS por regional" },
      {
        property: "og:description",
        content: "Comparativo territorial de PQRS con causa predominante y tiempos de gestión.",
      },
    ],
  }),
  component: RegionalesPage,
});

function RegionalesPage() {
  const { data } = useFiltros();
  const conteo = contarPor(data, "regional");
  const total = data.length;

  const detalle = REGIONALES.map((reg) => {
    const rows = data.filter((r) => r.regional === reg);
    const causa = contarPor(rows, "causa")[0];
    const servicio = contarPor(rows, "tipoServicio")[0];
    const tiempo = rows.length
      ? Math.round((rows.reduce((a, r) => a + r.tiempoGestion, 0) / rows.length) * 10) / 10
      : 0;
    const abiertas = rows.filter((r) => r.estado !== "Cerrada").length;
    return { reg, total: rows.length, causa: causa?.name ?? "—", servicio: servicio?.name ?? "—", tiempo, abiertas };
  })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Regionales"
        subtitle="Comparativo territorial del comportamiento de las PQRS"
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
            <ChartCard title="PQRS por regional" description="Volumen total según los filtros aplicados">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conteo} margin={{ top: 8, right: 12, left: -18, bottom: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {conteo.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {detalle.map((d) => (
                <div key={d.reg} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="min-w-0 truncate text-sm font-semibold">{d.reg}</h3>
                    <span className="shrink-0 text-lg font-semibold">{d.total}</span>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Causa predominante</dt>
                      <dd className="min-w-0 truncate text-right font-medium">{d.causa}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Servicio más reportado</dt>
                      <dd className="min-w-0 truncate text-right font-medium">{d.servicio}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Tiempo promedio</dt>
                      <dd className="font-medium">{d.tiempo} días</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Pendientes de cierre</dt>
                      <dd className="font-medium">{d.abiertas}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}