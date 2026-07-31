import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, Copy, GitMerge, ShieldCheck } from "lucide-react";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HOMOLOGACION, HOMOLOGACION_METRICAS } from "@/data/pqrs";
import { useFiltros } from "@/lib/pqrs-filters";
import { contarPor } from "@/lib/pqrs-metrics";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios y homologación | Dashboard PQRS" },
      {
        name: "description",
        content:
          "Ranking de servicios reportados y homologación de la nomenclatura del CRM para indicadores comparables.",
      },
      { property: "og:title", content: "Servicios y homologación | Dashboard PQRS" },
      {
        property: "og:description",
        content: "Unificación de nomenclatura de servicios y ranking de PQRS por servicio homologado.",
      },
    ],
  }),
  component: ServiciosPage,
});

const PASOS = [
  "Texto libre del CRM",
  "Limpieza y normalización",
  "Reglas de homologación",
  "Servicio estandarizado",
  "Indicador comparable",
];

function ServiciosPage() {
  const { data } = useFiltros();
  const ranking = contarPor(data, "tipoServicio");
  const total = data.length;

  const metricas = [
    { icon: Building2, label: "Variantes de servicio en el CRM", value: HOMOLOGACION_METRICAS.registrosCrm },
    { icon: Copy, label: "Variantes consolidadas", value: HOMOLOGACION_METRICAS.duplicados },
    { icon: GitMerge, label: "Servicios homologados", value: HOMOLOGACION_METRICAS.homologados },
    { icon: ShieldCheck, label: "% de homologación", value: `${HOMOLOGACION_METRICAS.porcentaje}%` },
  ];

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Servicios y homologación"
        subtitle="Cómo se estandarizan los servicios reportados en el CRM para obtener indicadores confiables"
      >
        <div className="lg:max-w-md">
          <DemoNotice />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <FiltersPanel />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricas.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <m.icon className="h-4 w-4 text-accent" />
                <span className="min-w-0 truncate">{m.label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">{m.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Homologación de servicios</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Un mismo servicio se registra con múltiples redacciones en el CRM. La homologación unifica
            esas variantes y evita la dispersión de los indicadores por servicio.
          </p>
          <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center">
            {PASOS.map((p, i) => (
              <div key={p} className="flex min-w-0 flex-1 items-center gap-2">
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-center text-xs font-medium">
                  {p}
                </div>
                {i < PASOS.length - 1 ? (
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground lg:rotate-0" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Texto registrado en el CRM</TableHead>
                  <TableHead>Servicio homologado</TableHead>
                  <TableHead className="text-right">Casos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HOMOLOGACION.slice(0, 60).map((h) => (
                  <TableRow key={h.crm}>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {h.crm}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">{h.ips}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{h.casos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <ChartCard
          title="Ranking de servicios"
          description="PQRS por servicio homologado según los filtros aplicados"
        >
          {total === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Servicio homologado</TableHead>
                    <TableHead className="text-right">PQRS</TableHead>
                    <TableHead className="text-right">Participación</TableHead>
                    <TableHead className="min-w-[160px]">Peso relativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, i) => (
                    <TableRow key={r.name}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">{r.name}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{r.value}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {((r.value / total) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="h-2 w-full min-w-[120px] rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${(r.value / ranking[0].value) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}