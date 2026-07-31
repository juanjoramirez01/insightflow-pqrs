import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { DemoNotice, PageHeader } from "@/components/dashboard/PageHeader";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { ChartCard, EmptyState } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFiltros } from "@/lib/pqrs-filters";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes de PQRS | Detalle de registros" },
      {
        name: "description",
        content:
          "Consulta el detalle de los registros de PQRS filtrados y expórtalos en formato CSV.",
      },
      { property: "og:title", content: "Reportes de PQRS" },
      {
        property: "og:description",
        content: "Detalle tabular de registros PQRS con exportación CSV.",
      },
    ],
  }),
  component: ReportesPage,
});

const PAGE = 25;

function ReportesPage() {
  const { data } = useFiltros();
  const [pagina, setPagina] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(data.length / PAGE));
  const pageIdx = Math.min(pagina, totalPaginas - 1);
  const filas = useMemo(
    () => data.slice(pageIdx * PAGE, pageIdx * PAGE + PAGE),
    [data, pageIdx],
  );

  const exportar = () => {
    const headers = [
      "id",
      "fecha",
      "causa",
      "subcausa",
      "detalle",
      "tipoServicio",
      "prestadorCrm",
      "prestador",
      "regional",
      "estado",
      "tiempoGestion",
    ];
    const csv = [
      headers.join(","),
      ...data.map((r) =>
        headers.map((h) => `"${String(r[h as keyof typeof r] ?? "")}"`).join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-pqrs-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Reporte exportado (${data.length} registros demostrativos)`);
  };

  const estadoColor = (estado: string) =>
    estado === "Cerrada"
      ? "bg-success/12 text-success"
      : estado === "En gestión"
        ? "bg-warning/15 text-foreground"
        : "bg-critical/12 text-critical";

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Reportes"
        subtitle="Detalle de los registros de PQRS que cumplen con los filtros aplicados"
      >
        <div className="lg:max-w-md">
          <DemoNotice />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <FiltersPanel />

        <ChartCard
          title={`Registros filtrados (${data.length.toLocaleString("es-CO")})`}
          description="Vista tabular con desplazamiento horizontal en pantallas pequeñas"
          action={
            <Button size="sm" variant="outline" onClick={exportar} disabled={data.length === 0}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exportar CSV
            </Button>
          }
        >
          {data.length === 0 ? (
            <EmptyState mensaje="Ninguna PQRS coincide con la combinación de filtros seleccionada." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Causa</TableHead>
                      <TableHead>Subcausa</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>IPS homologada</TableHead>
                      <TableHead>Regional</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filas.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap font-mono text-xs">{r.id}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.fecha}</TableCell>
                        <TableCell className="max-w-[230px] truncate text-xs">{r.causa}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.subcausa}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.detalle}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.tipoServicio}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.prestador}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{r.regional}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={estadoColor(r.estado)}>
                            {r.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs">{r.tiempoGestion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Página {pageIdx + 1} de {totalPaginas}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagina((p) => Math.max(0, p - 1))}
                    disabled={pageIdx === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                    disabled={pageIdx >= totalPaginas - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </ChartCard>
      </div>
    </div>
  );
}