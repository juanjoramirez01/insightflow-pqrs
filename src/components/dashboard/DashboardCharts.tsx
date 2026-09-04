import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import { TooltipBox } from "@/components/charts/ChartTooltip";
import {
  CHART_COLORS,
  contarPor,
  MENOR_DE_EDAD_UMBRAL,
  porCumplimientoSla,
  tendencia,
  tendenciaTiempoGestion,
  UMBRAL_DIAS_GESTION,
} from "@/lib/pqrs-metrics";
import type { PqrsRecord } from "@/data/pqrs";

const axis = { fontSize: 11, fill: "var(--muted-foreground)" };

function GraficoPie({ data: puntos }: { data: { name: string; value: number }[] }) {
  const total = puntos.reduce((a, b) => a + b.value, 0);
  if (puntos.length === 0) return <EmptyState />;
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={puntos}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="var(--card)"
            animationDuration={300}
          >
            {puntos.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                  <p className="max-w-[240px] font-medium">{payload[0].name}</p>
                  <p className="mt-1 text-muted-foreground">
                    <span className="font-semibold text-foreground">{payload[0].value}</span> PQRS ·{" "}
                    {total ? Math.round((Number(payload[0].value) / total) * 100) : 0}%
                  </p>
                </div>
              ) : null
            }
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            formatter={(v: string) => <span className="text-xs text-muted-foreground">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardCharts({ data }: { data: PqrsRecord[] }) {
  // Con ~29.000 registros en vivo, recalcular todo esto en cada render (no
  // solo cuando `data` cambia) es notorio: se memoiza para que un re-render
  // no relacionado con los datos no vuelva a recorrer el arreglo completo.
  const {
    porServicio,
    porResultado,
    topAnalistas,
    serie,
    porCausa,
    totalCausas,
    porEstadoGestion,
    porMenorDeEdad,
    porSla,
    tiempoGestionPorMes,
  } = useMemo(() => {
    const porCausaCalc = contarPor(data, "causa");
    const conEdad = data.filter((r) => r.edad !== null);
    const menores = conEdad.filter((r) => (r.edad as number) < MENOR_DE_EDAD_UMBRAL).length;
    const hoyIso = new Date().toISOString().slice(0, 10);

    return {
      porServicio: contarPor(data, "tipoServicio"),
      porResultado: contarPor(data, "resultado")
        .filter((r) => r.name)
        .slice(0, 10),
      topAnalistas: contarPor(data, "analista").slice(0, 7),
      serie: tendencia(data),
      porCausa: porCausaCalc,
      totalCausas: porCausaCalc.reduce((a, b) => a + b.value, 0),
      porEstadoGestion: contarPor(data, "estado"),
      porMenorDeEdad: [
        { name: "No es menor de edad", value: conEdad.length - menores },
        { name: "Es menor de edad", value: menores },
      ].filter((s) => s.value > 0),
      porSla: porCumplimientoSla(data, hoyIso),
      tiempoGestionPorMes: tendenciaTiempoGestion(data),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ChartCard
        title="PQRS por tipo de servicio"
        description="Distribución según el servicio reportado"
      >
        {porServicio.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porServicio} margin={{ top: 8, right: 8, left: -18, bottom: 28 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={axis} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="value"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Resultado esperado del usuario"
        description="Qué esperan resolver los usuarios que radican una PQRS (top 10)"
      >
        {porResultado.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={porResultado}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => (v.length > 24 ? `${v.slice(0, 23)}…` : v)}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="value"
                  fill="var(--chart-5)"
                  radius={[0, 6, 6, 0]}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Top de responsables de gestión"
        description="Analistas con mayor volumen de casos asignados"
      >
        {topAnalistas.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topAnalistas}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="value"
                  fill="var(--chart-3)"
                  radius={[0, 6, 6, 0]}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Distribución de causas"
        description="Participación porcentual por causa principal"
      >
        {porCausa.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porCausa}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="var(--card)"
                  animationDuration={300}
                >
                  {porCausa.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                        <p className="max-w-[240px] font-medium">{payload[0].name}</p>
                        <p className="mt-1 text-muted-foreground">
                          <span className="font-semibold text-foreground">{payload[0].value}</span>{" "}
                          PQRS ·{" "}
                          {totalCausas
                            ? Math.round((Number(payload[0].value) / totalCausas) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={64}
                  formatter={(v: string) => (
                    <span className="text-xs text-muted-foreground">
                      {v.length > 42 ? `${v.slice(0, 41)}…` : v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Tendencia temporal"
        description="Evolución mensual de las PQRS en el periodo seleccionado"
        className="xl:col-span-2"
      >
        {serie.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTendencia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--border)" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  fill="url(#gradTendencia)"
                  dot={{ r: 3, fill: "var(--chart-3)" }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Estado de gestión"
        description="Distribución completa por estado real registrado en el CRM"
      >
        <GraficoPie data={porEstadoGestion} />
      </ChartCard>

      <ChartCard
        title="Cumplimiento de fecha de vencimiento"
        description="Casos gestionados dentro o fuera del plazo (SLA) frente a su fecha de vencimiento"
      >
        <GraficoPie data={porSla} />
      </ChartCard>

      <ChartCard
        title="Tiempo de gestión promedio por mes"
        description="Promedio de días de gestión de los casos cerrados, según su mes de cierre"
        className="xl:col-span-2"
      >
        {tiempoGestionPorMes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={tiempoGestionPorMes}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBox />} cursor={{ stroke: "var(--border)" }} />
                <ReferenceLine
                  y={UMBRAL_DIAS_GESTION}
                  stroke="var(--critical)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Máximo días de gestión: ${UMBRAL_DIAS_GESTION}`,
                    position: "insideTopLeft",
                    fontSize: 11,
                    fill: "var(--critical)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--chart-2)" }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
