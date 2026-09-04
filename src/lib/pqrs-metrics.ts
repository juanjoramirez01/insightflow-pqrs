import { MESES_ES, type PqrsRecord } from "@/data/pqrs";

export interface Conteo {
  name: string;
  value: number;
}

export function contarPor(data: PqrsRecord[], key: keyof PqrsRecord): Conteo[] {
  const map = new Map<string, number>();
  for (const r of data) {
    const k = String(r[key]);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function tendencia(data: PqrsRecord[]) {
  const map = new Map<string, number>();
  for (const r of data) map.set(r.periodo, (map.get(r.periodo) ?? 0) + 1);
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([periodo, value]) => {
      const [y, m] = periodo.split("-");
      return { periodo, name: `${MESES_ES[Number(m) - 1]} ${y.slice(2)}`, value };
    });
}

export interface Kpis {
  total: number;
  abiertas: number;
  cerradas: number;
  recurrencia: number;
  tiempoPromedio: number;
  deltaTotal: number;
  deltaAbiertas: number;
  deltaCerradas: number;
  deltaRecurrencia: number;
  deltaTiempo: number;
}

const pct = (actual: number, previo: number) =>
  previo === 0 ? 0 : Math.round(((actual - previo) / previo) * 1000) / 10;

function resumen(data: PqrsRecord[]) {
  const total = data.length;
  const abiertas = data.filter((r) => !r.cerrada).length;
  const cerradas = data.filter((r) => r.cerrada).length;
  const recurrencia = total ? (data.filter((r) => r.recurrente).length / total) * 100 : 0;
  const conCierre = data.filter((r) => r.cerrada && r.tiempoGestion > 0);
  const tiempoPromedio = conCierre.length
    ? conCierre.reduce((acc, r) => acc + r.tiempoGestion, 0) / conCierre.length
    : 0;
  return { total, abiertas, cerradas, recurrencia, tiempoPromedio };
}

/** Compara el ultimo periodo presente contra el anterior dentro del set filtrado. */
export function calcularKpis(data: PqrsRecord[], todosLosPeriodos: string[]): Kpis {
  const actualTotal = resumen(data);
  const periodos = [...todosLosPeriodos].sort();
  const presentes = [...new Set(data.map((r) => r.periodo))].sort();
  const ultimo = presentes[presentes.length - 1];
  const idx = periodos.indexOf(ultimo);
  const anterior = idx > 0 ? periodos[idx - 1] : null;
  const a = resumen(data.filter((r) => r.periodo === ultimo));
  const b = anterior ? resumen(data.filter((r) => r.periodo === anterior)) : null;

  return {
    ...actualTotal,
    recurrencia: Math.round(actualTotal.recurrencia * 10) / 10,
    tiempoPromedio: Math.round(actualTotal.tiempoPromedio * 10) / 10,
    deltaTotal: b ? pct(a.total, b.total) : 0,
    deltaAbiertas: b ? pct(a.abiertas, b.abiertas) : 0,
    deltaCerradas: b ? pct(a.cerradas, b.cerradas) : 0,
    deltaRecurrencia: b ? pct(a.recurrencia, b.recurrencia) : 0,
    deltaTiempo: b ? pct(a.tiempoPromedio, b.tiempoPromedio) : 0,
  };
}

// Inferido del reporte de Zoho Analytics compartido (línea "Threshold: Máximo días de gestión = 7.00");
// confirmar con negocio si el SLA real es distinto.
export const UMBRAL_DIAS_GESTION = 7;

/** Promedio de días de gestión de los casos cerrados, agrupado por mes de cierre. */
export function tendenciaTiempoGestion(data: PqrsRecord[]) {
  const porMes = new Map<string, { suma: number; conteo: number }>();
  for (const r of data) {
    if (!r.cerrada || !r.fechaCierre) continue;
    const periodoCierre = r.fechaCierre.slice(0, 7);
    const acc = porMes.get(periodoCierre) ?? { suma: 0, conteo: 0 };
    acc.suma += r.tiempoGestion;
    acc.conteo += 1;
    porMes.set(periodoCierre, acc);
  }
  return [...porMes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([periodo, { suma, conteo }]) => {
      const [y, m] = periodo.split("-");
      return {
        periodo,
        name: `${MESES_ES[Number(m) - 1]} ${y.slice(2)}`,
        value: Math.round((suma / conteo) * 10) / 10,
      };
    });
}

export const MENOR_DE_EDAD_UMBRAL = 18;

export interface EstadoSla {
  name: string;
  value: number;
}

/**
 * Compara la fecha de cierre (si el caso ya cerró) o la fecha actual (si sigue
 * abierto) contra `fechaVencimiento`. Los casos sin fecha de vencimiento se
 * cuentan aparte en vez de asumirse "dentro" del plazo.
 */
export function porCumplimientoSla(data: PqrsRecord[], hoyIso: string): EstadoSla[] {
  let dentro = 0;
  let fuera = 0;
  let sinFecha = 0;
  for (const r of data) {
    if (!r.fechaVencimiento) {
      sinFecha += 1;
      continue;
    }
    const referencia = r.cerrada && r.fechaCierre ? r.fechaCierre : hoyIso;
    if (referencia <= r.fechaVencimiento) dentro += 1;
    else fuera += 1;
  }
  return [
    { name: "Dentro de la fecha", value: dentro },
    { name: "Fuera de la fecha", value: fuera },
    { name: "Sin fecha de vencimiento", value: sinFecha },
  ].filter((s) => s.value > 0);
}

export interface StackedPorSubcausa {
  rows: Record<string, string | number>[];
  keys: string[];
}

// Nombre del cajón "el resto de detalles" del stacked bar. Deliberadamente
// distinto de "Otro", que es un valor real que Zoho puede traer como detalle
// (agentes que eligen literalmente "Otro"); si se llamaran igual, el tooltip
// mostraría "Otro" y "Otros" juntos y parecería un error.
const RESTO_DETALLES = "Otros detalles (agrupados)";

/**
 * Construye filas para un stacked bar: una fila por subcausa, con una columna
 * por cada uno de los `topPorSubcausa` detalles más frecuentes DENTRO DE ESA
 * MISMA subcausa (no del total global) — así cada fila muestra su propia
 * composición en vez de que solo las subcausas con detalles "populares a nivel
 * global" se vean desglosadas y el resto quede aplastado en un solo color.
 * El resto de detalles de cada subcausa (incluyendo el valor literal "Otro",
 * que es en sí mismo genérico) se agrupa bajo RESTO_DETALLES.
 */
export function construirStackedPorSubcausa(
  data: PqrsRecord[],
  topPorSubcausa = 4,
): StackedPorSubcausa {
  const filasPorSubcausa = new Map<string, PqrsRecord[]>();
  for (const r of data) {
    const arr = filasPorSubcausa.get(r.subcausa) ?? [];
    arr.push(r);
    filasPorSubcausa.set(r.subcausa, arr);
  }

  const subcausasOrdenadas = [...filasPorSubcausa.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );

  const keysOrdenadas: string[] = [];
  const keysVistas = new Set<string>();
  let hayResto = false;

  const rows = subcausasOrdenadas.map(([subcausa, filas]) => {
    const topDeEstaSubcausa = contarPor(filas, "detalle")
      .filter((d) => d.name.trim().toLowerCase() !== "otro")
      .slice(0, topPorSubcausa)
      .map((d) => d.name);
    const topSet = new Set(topDeEstaSubcausa);

    const conteos: Record<string, number> = {};
    for (const r of filas) {
      const clave = topSet.has(r.detalle) ? r.detalle : RESTO_DETALLES;
      conteos[clave] = (conteos[clave] ?? 0) + 1;
    }
    if (RESTO_DETALLES in conteos) hayResto = true;

    for (const k of topDeEstaSubcausa) {
      if (!keysVistas.has(k)) {
        keysVistas.add(k);
        keysOrdenadas.push(k);
      }
    }

    return { subcausa, total: filas.length, ...conteos };
  });

  const keys = hayResto ? [...keysOrdenadas, RESTO_DETALLES] : keysOrdenadas;

  return { rows, keys };
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
