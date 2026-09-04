import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { EmptyState } from "@/components/dashboard/ChartCard";
import { useFiltros } from "@/lib/pqrs-filters";
import { calcularKpis } from "@/lib/pqrs-metrics";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de Indicadores PQRS | Analítica" },
      {
        name: "description",
        content:
          "Indicadores, filtros globales y análisis multidimensional de PQRS por causa, servicio, regional y responsable.",
      },
      { property: "og:title", content: "Dashboard de Indicadores PQRS" },
      {
        property: "og:description",
        content: "KPI, drill-down de causas y gráficos interactivos de PQRS.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, periodos } = useFiltros();
  const kpis = useMemo(() => calcularKpis(data, periodos), [data, periodos]);

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Dashboard de Indicadores PQRS"
        subtitle="Análisis integral de causas, subcausas y detalles de las PQRS"
      >
        <div className="lg:max-w-md">
          <DemoNotice />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <FiltersPanel />
        {data.length === 0 ? (
          <EmptyState mensaje="Ninguna PQRS coincide con la combinación de filtros seleccionada." />
        ) : (
          <>
            <KpiRow kpis={kpis} />
            <DashboardCharts data={data} />
          </>
        )}
      </div>
    </div>
  );
}
