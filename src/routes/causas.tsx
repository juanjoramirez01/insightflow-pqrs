import { createFileRoute } from "@tanstack/react-router";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { DrilldownCausas } from "@/components/dashboard/DrilldownCausas";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import { useFiltros } from "@/lib/pqrs-filters";
import { contarPor } from "@/lib/pqrs-metrics";
import { TAXONOMIA } from "@/data/pqrs";

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
  const { data } = useFiltros();
  const porDetalle = contarPor(data, "detalle").slice(0, 10);
  const total = data.length;

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
                  {Object.entries(TAXONOMIA).map(([causa, subs]) => (
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
          </>
        )}
      </div>
    </div>
  );
}