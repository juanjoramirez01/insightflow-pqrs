import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  Layers,
  LineChart,
  Lightbulb,
  Map,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/dashboard/PageHeader";
import { ValueFlow } from "@/components/dashboard/ValueFlow";
import { PQRS_DATA } from "@/data/pqrs";
import { contarPor, tendencia, calcularKpis } from "@/lib/pqrs-metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard PQRS | Analítica para la mejora continua" },
      {
        name: "description",
        content:
          "Portada ejecutiva del Dashboard de Indicadores PQRS: causas raíz, servicios, regionales y tendencias.",
      },
      { property: "og:title", content: "Dashboard PQRS | Analítica para la mejora continua" },
      {
        property: "og:description",
        content: "Convierte los datos de PQRS en decisiones para la mejora continua.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const kpis = calcularKpis(PQRS_DATA);
  const causas = contarPor(PQRS_DATA, "causa");
  const regional = contarPor(PQRS_DATA, "regional")[0];
  const analista = contarPor(PQRS_DATA, "analista")[0];
  const servicio = contarPor(PQRS_DATA, "tipoServicio")[0];
  const serie = tendencia(PQRS_DATA);
  const variacion =
    serie.length > 1
      ? Math.round(
          ((serie[serie.length - 1].value - serie[0].value) / serie[0].value) * 1000,
        ) / 10
      : 0;

  const resumen = [
    {
      icon: Layers,
      label: "Principal causa",
      value: causas[0]?.name ?? "—",
      hint: `${causas[0]?.value ?? 0} PQRS · ${Math.round(((causas[0]?.value ?? 0) / PQRS_DATA.length) * 100)}% del total`,
    },
    {
      icon: Map,
      label: "Regional con mayor volumen",
      value: regional?.name ?? "—",
      hint: `${regional?.value ?? 0} PQRS registradas`,
    },
    {
      icon: Building2,
      label: "Responsable con mayor carga",
      value: analista?.name ?? "—",
      hint: `${analista?.value ?? 0} PQRS asignadas`,
    },
    {
      icon: Stethoscope,
      label: "Servicio más recurrente",
      value: servicio?.name ?? "—",
      hint: `${servicio?.value ?? 0} PQRS asociadas`,
    },
    {
      icon: TrendingUp,
      label: "Tendencia de PQRS",
      value: `${variacion > 0 ? "+" : ""}${variacion}%`,
      hint: "Variación del primer al último mes del periodo",
    },
    {
      icon: Target,
      label: "Tiempo promedio de gestión",
      value: `${kpis.tiempoPromedio} días`,
      hint: `${kpis.recurrencia}% de recurrencia identificada`,
    },
  ];

  const oportunidades = [
    {
      titulo: "Disponibilidad de agenda",
      texto:
        "La subcausa Oportunidad concentra los detalles Sin agenda y Agenda lejana: ampliar oferta y monitorear tiempos de asignación.",
    },
    {
      titulo: "Calidad en autorizaciones",
      texto:
        "Los errores en CUPS y direccionamiento son evitables: reforzar validación previa y capacitación del equipo autorizador.",
    },
    {
      titulo: "Homologación de servicios",
      texto:
        "El CRM registra el tipo de servicio con múltiples variantes de texto; homologarlas permite indicadores comparables.",
    },
  ];

  return (
    <div className="min-w-0">
      <section
        className="relative overflow-hidden px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma analítica empresarial · Sector salud
            </span>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Dashboard de Indicadores PQRS
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Convierte los datos de PQRS en decisiones para la mejora continua.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cyan text-navy-deep hover:bg-cyan/90">
                <Link to="/dashboard">
                  Explorar dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/causas">Ver análisis de causas</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: "PQRS analizadas", v: kpis.total.toLocaleString("es-CO") },
                { k: "Causas raíz", v: causas.length },
                { k: "Regionales", v: REGIONALES.length },
                { k: "Servicios homologados", v: TIPOS_SERVICIO.length },
              ].map((s) => (
                <div key={s.k} className="min-w-0">
                  <dt className="truncate text-xs text-white/60">{s.k}</dt>
                  <dd className="text-xl font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur">
            <div className="rounded-xl bg-card p-4 text-foreground shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">Vista previa · Análisis de causas</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                  Demo
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {causas.map((c, i) => {
                  const pctv = Math.round((c.value / causas[0].value) * 100);
                  return (
                    <div key={c.name} className="min-w-0">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="truncate text-muted-foreground">{c.name}</span>
                        <span className="shrink-0 font-semibold">{c.value}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${pctv}%`,
                            background: `var(--chart-${i + 1})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Abiertas</p>
                  <p className="text-sm font-semibold">{kpis.abiertas}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Cerradas</p>
                  <p className="text-sm font-semibold">{kpis.cerradas}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Recurrencia</p>
                  <p className="text-sm font-semibold">{kpis.recurrencia}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <DemoNotice />

        <section>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Resumen ejecutivo</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resumen.map((r) => (
              <div
                key={r.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lg"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <r.icon className="h-4 w-4 text-accent" />
                  {r.label}
                </div>
                <p className="mt-2 text-base font-semibold leading-snug text-foreground">
                  {r.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Principales oportunidades de mejora</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {oportunidades.map((o) => (
              <div key={o.titulo} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm font-semibold">{o.titulo}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <ValueFlow />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: BarChart3, t: "Dashboard PQRS", d: "Indicadores, filtros y gráficos multidimensionales.", to: "/dashboard" as const },
            { icon: LineChart, t: "Análisis de causas", d: "Drill-down Causa → Subcausa → Detalle.", to: "/causas" as const },
            { icon: Building2, t: "Servicios", d: "Homologación de servicios y ranking confiable.", to: "/servicios" as const },
          ].map((c) => (
            <Link
              key={c.t}
              to={c.to}
              className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-accent hover:shadow-lg"
            >
              <c.icon className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-semibold">{c.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
              <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
                Abrir <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
