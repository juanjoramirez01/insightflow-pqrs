import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "./ChartCard";
import { TooltipBox } from "@/components/charts/ChartTooltip";
import { CHART_COLORS, contarPor, tendencia } from "@/lib/pqrs-metrics";
import type { PqrsRecord } from "@/data/pqrs";

const axis = { fontSize: 11, fill: "var(--muted-foreground)" };

export function DashboardCharts({ data }: { data: PqrsRecord[] }) {
  const porServicio = contarPor(data, "tipoServicio");
  const porRegional = contarPor(data, "regional");
  const topPrestadores = contarPor(data, "analista").slice(0, 7);
  const serie = tendencia(data);
  const porCausa = contarPor(data, "causa");
  const totalCausas = porCausa.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ChartCard title="PQRS por tipo de servicio" description="Distribución según el servicio reportado">
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
                <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="PQRS por regional" description="Comparativo entre regionales de operación">
        {porRegional.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={porRegional}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={axis}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Top de prestadores"
        description="IPS homologadas con mayor número de PQRS"
      >
        {topPrestadores.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topPrestadores}
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
                <Bar dataKey="value" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Distribución de causas" description="Participación porcentual por causa principal">
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
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
}