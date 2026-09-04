import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, ChevronRight, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard, EmptyState } from "./ChartCard";
import { TooltipBox } from "@/components/charts/ChartTooltip";
import type { PqrsRecord } from "@/data/pqrs";
import { contarPor } from "@/lib/pqrs-metrics";

type Nivel = "servicio" | "categoria";

// Altura visible máxima: con muchas categorías el gráfico crece hacia adentro
// (scroll propio) en vez de alargar toda la página indefinidamente.
const ALTURA_MAXIMA_VISIBLE = 480;

/** Igual en interacción a DrilldownCausas, pero con 2 niveles: Servicio -> Categoría específica. */
export function DrilldownServicios({ data }: { data: PqrsRecord[] }) {
  const [servicio, setServicio] = useState<string | null>(null);
  const nivel: Nivel = servicio ? "categoria" : "servicio";

  const filtrado = useMemo(
    () => (servicio ? data.filter((r) => r.tipoServicio === servicio) : data),
    [data, servicio],
  );

  const items = useMemo(() => {
    const key = nivel === "servicio" ? "tipoServicio" : "categoriaServicioEspecifico";
    const conteos = contarPor(filtrado, key as keyof PqrsRecord);
    // "Sin categoría" (Categoria_servicio_especifico vacío en Zoho) se oculta
    // por ahora: la mayoría de los casos aún no la tienen diligenciada y
    // domina el gráfico sin aportar información accionable.
    return nivel === "categoria" ? conteos.filter((c) => c.name !== "Sin categoría") : conteos;
  }, [filtrado, nivel]);

  const total = items.reduce((a, b) => a + b.value, 0);

  const onBarClick = (name: string) => {
    if (nivel === "servicio") setServicio(name);
  };

  const retroceder = () => setServicio(null);

  const crumb = (label: string, active: boolean, onClick?: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={
        "max-w-[220px] truncate rounded px-1.5 py-0.5 text-xs transition-colors " +
        (active
          ? "font-semibold text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-primary")
      }
    >
      {label}
    </button>
  );

  const alturaChart = Math.max(220, items.length * 44);

  return (
    <ChartCard
      title="Servicio → Categoría específica"
      description="Explora cada tipo de servicio y su categoría específica haciendo clic en las barras."
      action={
        nivel !== "servicio" ? (
          <Button variant="outline" size="sm" onClick={retroceder}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Nivel anterior
          </Button>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <MousePointerClick className="h-3 w-3" /> Interactivo
          </Badge>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg bg-muted/60 px-2 py-1.5">
        {crumb("Todos los servicios", nivel === "servicio", servicio ? retroceder : undefined)}
        {servicio ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
        {servicio ? crumb(servicio, true) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Nivel actual:{" "}
          <span className="font-medium text-foreground">
            {nivel === "servicio" ? "Tipo de servicio" : "Categoría específica"}
          </span>
        </span>
        <span>
          Total en el nivel: <span className="font-medium text-foreground">{total}</span> PQRS
        </span>
        {nivel === "servicio" ? (
          <span>Haz clic en una barra para ver su categoría específica.</span>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState mensaje="No hay PQRS en este nivel con los filtros aplicados." />
        </div>
      ) : (
        <div className="mt-4 w-full overflow-y-auto" style={{ maxHeight: ALTURA_MAXIMA_VISIBLE }}>
          <div className="w-full" style={{ height: alturaChart }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
                barCategoryGap={12}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={320}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: string) => (v.length > 46 ? `${v.slice(0, 45)}…` : v)}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="value"
                  radius={[0, 6, 6, 0]}
                  onClick={(d: { name?: string }) => d?.name && onBarClick(d.name)}
                  cursor={nivel === "categoria" ? "default" : "pointer"}
                  animationDuration={300}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    className="fill-foreground"
                    style={{ fontSize: 11, fontWeight: 600 }}
                  />
                  {items.map((_, i) => (
                    <Cell
                      key={i}
                      fill={nivel === "servicio" ? "var(--chart-2)" : "var(--chart-5)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
