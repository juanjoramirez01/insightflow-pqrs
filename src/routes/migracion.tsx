import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CloudDownload, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { migrarPqrsDesdeZoho } from "@/lib/zoho-migration.functions";

export const Route = createFileRoute("/migracion")({
  head: () => ({
    meta: [
      { title: "Migración desde Zoho CRM | Dashboard PQRS" },
      {
        name: "description",
        content:
          "Sincroniza los casos PQRS registrados en Zoho CRM con la base de datos institucional del dashboard.",
      },
      { property: "og:title", content: "Migración desde Zoho CRM | Dashboard PQRS" },
      {
        property: "og:description",
        content: "Traslado de casos PQRS desde Zoho CRM a la base de datos del dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MigracionPage,
});

function MigracionPage() {
  const migrar = useServerFn(migrarPqrsDesdeZoho);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<{ migrados: number; totalEnBase: number } | null>(null);

  const ejecutar = async () => {
    setCargando(true);
    try {
      const r = await migrar({});
      setResultado(r);
      toast.success(`Se migraron ${r.migrados} casos desde Zoho CRM`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No fue posible completar la migración");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-w-0 pb-12">
      <PageHeader
        title="Migración desde Zoho CRM"
        subtitle="Trae los casos PQRS registrados en Zoho CRM y los guarda en la base de datos del tablero."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Sincronización de casos" description="Los casos existentes se actualizan por su identificador de Zoho.">
          <div className="flex flex-col gap-4 p-2">
            <p className="text-sm text-muted-foreground">
              La migración recorre el módulo PQRS de Zoho CRM en páginas de 200 registros y
              guarda nombre, contacto, asunto, descripción, estado y fechas de creación y
              modificación.
            </p>
            <Button onClick={ejecutar} disabled={cargando} className="w-fit gap-2">
              {cargando ? <Loader2 className="size-4 animate-spin" /> : <CloudDownload className="size-4" />}
              {cargando ? "Migrando…" : "Iniciar migración"}
            </Button>
          </div>
        </ChartCard>

        <ChartCard title="Resultado" description="Estado de la última ejecución en esta sesión.">
          <div className="flex flex-col gap-3 p-2 text-sm">
            {resultado ? (
              <>
                <div className="flex items-center gap-2">
                  <CloudDownload className="size-4 text-primary" />
                  <span>
                    Casos traídos de Zoho: <strong>{resultado.migrados.toLocaleString("es-CO")}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  <span>
                    Total almacenado: <strong>{resultado.totalEnBase.toLocaleString("es-CO")}</strong>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Aún no se ha ejecutado la migración.</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
