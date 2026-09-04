import { useMemo } from "react";
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
import { useFiltros } from "@/lib/pqrs-filters";
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
        content:
          "Portada ejecutiva del Dashboard de Indicadores PQRS: causas raíz, servicios, regionales y tendencias.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { todos, regionales, tiposServicio, periodos } = useFiltros();

  // ~29.000 registros en vivo: se memoiza todo este bloque para que no se
  // recorra el arreglo completo (8 pasadas) en cada render que no cambie los datos.
  const {
    kpis,
    causas,
    regional,
    analista,
    servicio,
    tendenciaDireccion,
    causaTop,
    subDeCausaTop,
    detalleTop,
    resultadoTop,
  } = useMemo(() => {
    const causasCalc = contarPor(todos, "causa");
    const serie = tendencia(todos);
    // Se compara solo el último mes vs. el anterior (no el primero vs. el
    // último): con datos en vivo el primer mes histórico tiene muy pocos
    // registros y esa comparación produce variaciones sin sentido (+800000%).
    const direccion =
      serie.length > 1
        ? serie[serie.length - 1].value === serie[serie.length - 2].value
          ? "Estable"
          : serie[serie.length - 1].value > serie[serie.length - 2].value
            ? "Al alza"
            : "A la baja"
        : "Sin datos suficientes";

    const causaTopCalc = causasCalc[0];
    const subDeCausaTopCalc = causaTopCalc
      ? contarPor(
          todos.filter((r) => r.causa === causaTopCalc.name),
          "subcausa",
        )[0]
      : null;

    return {
      kpis: calcularKpis(todos, periodos),
      causas: causasCalc,
      regional: contarPor(todos, "regional")[0],
      analista: contarPor(todos, "analista")[0],
      servicio: contarPor(todos, "tipoServicio")[0],
      tendenciaDireccion: direccion,
      causaTop: causaTopCalc,
      subDeCausaTop: subDeCausaTopCalc,
      detalleTop: contarPor(todos, "detalle").filter((d) => d.name !== "Sin detalle")[0],
      resultadoTop: contarPor(todos, "resultado").filter((r) => r.name)[0],
    };
  }, [todos, periodos]);

  const resumen = [
    {
      icon: Layers,
      label: "Principal causa",
      value: causas[0]?.name ?? "—",
      hint: `${causas[0]?.value ?? 0} PQRS · ${Math.round(((causas[0]?.value ?? 0) / todos.length) * 100)}% del total`,
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
      value: tendenciaDireccion,
      hint: "Comparado con el mes anterior",
    },
    {
      icon: Target,
      label: "Tiempo promedio de gestión",
      value: `${kpis.tiempoPromedio} días`,
      hint: `${kpis.recurrencia}% de recurrencia identificada`,
    },
  ];

  // Oportunidades calculadas en vivo a partir de los datos reales (antes eran
  // 3 textos fijos escritos para el CSV histórico, que podían quedar desactualizados).
  const oportunidades = [
    causaTop && subDeCausaTop
      ? {
          titulo: "Causa raíz principal",
          texto: `"${causaTop.name}" concentra ${causaTop.value.toLocaleString("es-CO")} PQRS (${Math.round((causaTop.value / todos.length) * 100)}% del total); dentro de ella, "${subDeCausaTop.name}" es la subcausa más frecuente.`,
        }
      : null,
    detalleTop
      ? {
          titulo: "Detalle operativo más recurrente",
          texto: `"${detalleTop.name}" aparece en ${detalleTop.value.toLocaleString("es-CO")} PQRS — conviene revisar el proceso operativo asociado.`,
        }
      : null,
    resultadoTop
      ? {
          titulo: "Lo que más piden los usuarios",
          texto: `"${resultadoTop.name}" es el resultado esperado más solicitado (${resultadoTop.value.toLocaleString("es-CO")} PQRS).`,
        }
      : null,
  ].filter((o): o is { titulo: string; texto: string } => o !== null);

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
                { k: "Regionales", v: regionales.length },
                { k: "Servicios homologados", v: tiposServicio.length },
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
                  Datos reales
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
              <div
                key={o.titulo}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <p className="text-sm font-semibold">{o.titulo}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <ValueFlow />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: BarChart3,
              t: "Dashboard PQRS",
              d: "Indicadores, filtros y gráficos multidimensionales.",
              to: "/dashboard" as const,
            },
            {
              icon: LineChart,
              t: "Análisis de causas",
              d: "Drill-down Causa → Subcausa → Detalle.",
              to: "/causas" as const,
            },
            {
              icon: Building2,
              t: "Servicios",
              d: "Homologación de servicios y ranking confiable.",
              to: "/servicios" as const,
            },
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
                Abrir{" "}
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
