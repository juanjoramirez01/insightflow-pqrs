import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import { DrilldownServicios } from "@/components/dashboard/DrilldownServicios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFiltros } from "@/lib/pqrs-filters";
import { contarPor } from "@/lib/pqrs-metrics";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios | Dashboard PQRS" },
      {
        name: "description",
        content: "Ranking de servicios y categorías específicas reportadas en las PQRS.",
      },
      { property: "og:title", content: "Servicios | Dashboard PQRS" },
      {
        property: "og:description",
        content: "Ranking de servicios y categorías específicas reportadas en las PQRS.",
      },
    ],
  }),
  component: ServiciosPage,
});

function ServiciosPage() {
  const { data } = useFiltros();
  const total = data.length;
  const ranking = useMemo(() => contarPor(data, "tipoServicio"), [data]);

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Servicios"
        subtitle="Ranking de servicios y categorías específicas reportadas en las PQRS"
      >
        <div className="lg:max-w-md">
          <DemoNotice />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <FiltersPanel />

        <ChartCard
          title="Ranking de servicios"
          description="PQRS por tipo de servicio según los filtros aplicados"
        >
          {total === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">PQRS</TableHead>
                    <TableHead className="text-right">Participación</TableHead>
                    <TableHead className="min-w-[160px]">Peso relativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, i) => (
                    <TableRow key={r.name}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {r.name}
                      </TableCell>
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

        {total === 0 ? <EmptyState /> : <DrilldownServicios data={data} />}
      </div>
    </div>
  );
}
