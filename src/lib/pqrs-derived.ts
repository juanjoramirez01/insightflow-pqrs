// Cálculos derivados de un conjunto de PQRS (taxonomía, catálogos de filtros,
// rango de fechas...). Antes se calculaban una sola vez a partir del JSON
// estático; ahora se recalculan con useMemo cada vez que llega un conjunto
// de datos nuevo (live desde Zoho CRM).
import type { PqrsRecord } from "@/data/pqrs";

const uniqOrdenado = (data: PqrsRecord[], get: (r: PqrsRecord) => string) => {
  const map = new Map<string, number>();
  for (const r of data) map.set(get(r), (map.get(get(r)) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
};

export interface PqrsCatalog {
  causas: string[];
  taxonomia: Record<string, Record<string, string[]>>;
  subcausasDe: (causa?: string | null) => string[];
  detallesDe: (causa?: string | null, subcausa?: string | null) => string[];
  tiposServicio: string[];
  regionales: string[];
  analistas: string[];
  prioridades: string[];
  periodos: string[];
  rangoFechas: { desde: string; hasta: string };
}

export function computeCatalog(data: PqrsRecord[]): PqrsCatalog {
  const taxonomiaSets: Record<string, Record<string, Set<string>>> = {};
  for (const r of data) {
    taxonomiaSets[r.causa] ??= {};
    taxonomiaSets[r.causa][r.subcausa] ??= new Set();
    taxonomiaSets[r.causa][r.subcausa].add(r.detalle);
  }
  const taxonomia: Record<string, Record<string, string[]>> = {};
  for (const [c, subs] of Object.entries(taxonomiaSets)) {
    taxonomia[c] = {};
    for (const [s, dets] of Object.entries(subs)) taxonomia[c][s] = [...dets].sort();
  }

  const tiposServicio = uniqOrdenado(data, (r) => r.tipoServicio);

  const periodos = [...new Set(data.map((r) => r.periodo))].sort();

  const rangoFechas = data.length
    ? {
        desde: data.reduce((a, r) => (r.fecha < a ? r.fecha : a), data[0].fecha),
        hasta: data.reduce((a, r) => (r.fecha > a ? r.fecha : a), data[0].fecha),
      }
    : { desde: "", hasta: "" };

  return {
    causas: uniqOrdenado(data, (r) => r.causa),
    taxonomia,
    subcausasDe: (causa) => (causa && taxonomia[causa] ? Object.keys(taxonomia[causa]).sort() : []),
    detallesDe: (causa, subcausa) =>
      causa && subcausa && taxonomia[causa]?.[subcausa] ? taxonomia[causa][subcausa] : [],
    tiposServicio,
    regionales: uniqOrdenado(data, (r) => r.regional),
    analistas: uniqOrdenado(data, (r) => r.analista),
    prioridades: uniqOrdenado(data, (r) => r.prioridad),
    periodos,
    rangoFechas,
  };
}
