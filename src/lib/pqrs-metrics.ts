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

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
