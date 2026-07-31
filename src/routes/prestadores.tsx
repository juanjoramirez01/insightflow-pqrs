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

export const Route = createFileRoute("/prestadores")({
  head: () => ({
    meta: [
      { title: "Prestadores y homologación de IPS | PQRS" },
      {
        name: "description",
        content:
          "Ranking de prestadores y proceso de homologación de IPS para evitar la dispersión de indicadores.",
      },
      { property: "og:title", content: "Prestadores y homologación de IPS" },
      {
        property: "og:description",
        content: "Unificación de nomenclatura de prestadores y ranking de PQRS por IPS.",
      },
    ],
  }),
  component: PrestadoresPage,
});

const PASOS = [
  "Registros CRM",
  "Detección de duplicados",
  "Unificación de nomenclatura",
  "Homologación",
  "IPS consolidada",
];

function PrestadoresPage() {
  const { data } = useFiltros();
  const ranking = contarPor(data, "prestador");
  const total = data.length;

  const metricas = [
    { icon: Building2, label: "Prestadores registrados (CRM)", value: HOMOLOGACION_METRICAS.registrosCrm },
    { icon: Copy, label: "Registros duplicados detectados", value: HOMOLOGACION_METRICAS.duplicados },
    { icon: GitMerge, label: "Prestadores homologados", value: HOMOLOGACION_METRICAS.homologados },
    { icon: ShieldCheck, label: "% de homologación", value: `${HOMOLOGACION_METRICAS.porcentaje}%` },
  ];

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Prestadores e IPS"
        subtitle="Ranking de prestadores y homologación de nomenclatura para indicadores confiables"
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
          <h2 className="text-lg font-semibold">Homologación de Prestadores</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Una misma institución puede registrarse con distintos nombres en el CRM. La homologación
            unifica esos registros y evita la dispersión de los indicadores por prestador.
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
                  <TableHead>Registro CRM</TableHead>
                  <TableHead>IPS homologada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HOMOLOGACION.map((h) => (
                  <TableRow key={h.crm}>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {h.crm}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">{h.ips}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <ChartCard
          title="Ranking de prestadores"
          description="PQRS por IPS homologada según los filtros aplicados"
        >
          {total === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>IPS homologada</TableHead>
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