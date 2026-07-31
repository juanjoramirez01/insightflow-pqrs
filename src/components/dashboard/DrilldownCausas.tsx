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
import { detallesDe, subcausasDe, type PqrsRecord } from "@/data/pqrs";
import { contarPor } from "@/lib/pqrs-metrics";
import { cn } from "@/lib/utils";

type Nivel = "causa" | "subcausa" | "detalle";

export function DrilldownCausas({ data }: { data: PqrsRecord[] }) {
  const [causa, setCausa] = useState<string | null>(null);
  const [subcausa, setSubcausa] = useState<string | null>(null);

  const nivel: Nivel = subcausa ? "detalle" : causa ? "subcausa" : "causa";

  const filtrado = useMemo(
    () =>
      data.filter(
        (r) => (!causa || r.causa === causa) && (!subcausa || r.subcausa === subcausa),
      ),
    [data, causa, subcausa],
  );

  const items = useMemo(() => {
    const key = nivel === "causa" ? "causa" : nivel === "subcausa" ? "subcausa" : "detalle";
    const conteos = contarPor(filtrado, key as keyof PqrsRecord);
    const universo =
      nivel === "subcausa"
        ? subcausasDe(causa)
        : nivel === "detalle"
          ? detallesDe(causa, subcausa)
          : null;
    if (!universo) return conteos;
    const map = new Map(conteos.map((c) => [c.name, c.value]));
    return universo
      .map((name) => ({ name, value: map.get(name) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [filtrado, nivel, causa, subcausa]);

  const total = items.reduce((a, b) => a + b.value, 0);

  const onBarClick = (name: string) => {
    if (nivel === "causa") setCausa(name);
    else if (nivel === "subcausa") setSubcausa(name);
  };

  const retroceder = () => {
    if (subcausa) setSubcausa(null);
    else setCausa(null);
  };

  const crumb = (label: string, active: boolean, onClick?: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "max-w-[220px] truncate rounded px-1.5 py-0.5 text-xs transition-colors",
        active
          ? "font-semibold text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-primary",
      )}
    >
      {label}
    </button>
  );

  const alturaChart = Math.max(260, items.length * 44);

  return (
    <ChartCard
      title="Análisis de causas raíz"
      description="Explora la jerarquía Causa principal → Subcausa → Detalle haciendo clic en las barras."
      action={
        nivel !== "causa" ? (
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
        {crumb("Todas las causas", nivel === "causa", causa ? () => { setCausa(null); setSubcausa(null); } : undefined)}
        {causa ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
        {causa ? crumb(causa, nivel === "subcausa", subcausa ? () => setSubcausa(null) : undefined) : null}
        {subcausa ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
        {subcausa ? crumb(subcausa, true) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Nivel actual:{" "}
          <span className="font-medium text-foreground">
            {nivel === "causa" ? "Causa principal" : nivel === "subcausa" ? "Subcausa" : "Detalle"}
          </span>
        </span>
        <span>
          Total en el nivel: <span className="font-medium text-foreground">{total}</span> PQRS
        </span>
        {nivel !== "detalle" ? <span>Haz clic en una barra para profundizar.</span> : null}
      </div>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState mensaje="No hay PQRS en este nivel con los filtros aplicados." />
        </div>
      ) : (
        <div className="mt-4 w-full" style={{ height: alturaChart }}>
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
                width={190}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v: string) => (v.length > 28 ? `${v.slice(0, 27)}…` : v)}
              />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                onClick={(d: { name?: string }) => d?.name && onBarClick(d.name)}
                cursor={nivel === "detalle" ? "default" : "pointer"}
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
                    fill={
                      nivel === "causa"
                        ? "var(--chart-1)"
                        : nivel === "subcausa"
                          ? "var(--chart-2)"
                          : "var(--chart-3)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}