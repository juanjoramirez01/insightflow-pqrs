// Dataset REAL de PQRS cargado desde el archivo entregado por la organización.
// Fuente: PQRS.csv (16.924 casos con fecha de apertura válida).

import raw from "./pqrs-dataset.json";

export type Estado =
  | "Cerrada"
  | "Cerrada por otra área"
  | "Transferida"
  | "En seguimiento"
  | "Sin iniciar";

export interface PqrsRecord {
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  periodo: string; // yyyy-mm
  causa: string;
  subcausa: string;
  detalle: string;
  servicioRaw: string; // tipo de servicio tal como viene del CRM
  tipoServicio: string; // servicio homologado
  regional: string;
  estado: Estado;
  tipoCaso: string;
  prioridad: string;
  resultado: string;
  analista: string;
  tiempoGestion: number; // dias (0 si aún no cierra)
  cerrada: boolean;
  validacionClinica: boolean;
  recurrente: boolean;
}

interface RawData {
  cols: string[];
  dicts: Record<string, string[]>;
  rows: (string | number | null)[][];
}

const D = raw as unknown as RawData;
const col = (name: string) => 2 + D.cols.indexOf(name);
const dic = (name: string, row: (string | number | null)[]) =>
  D.dicts[name][row[col(name)] as number];

export const PQRS_DATA: PqrsRecord[] = D.rows.map((row, i) => {
  const fecha = row[0] as string;
  const dias = row[1] as number | null;
  const estado = dic("estado", row) as Estado;
  return {
    id: `PQR-${String(i + 1).padStart(5, "0")}`,
    fecha,
    periodo: fecha.slice(0, 7),
    causa: dic("causa", row),
    subcausa: dic("subcausa", row),
    detalle: dic("detalle", row),
    servicioRaw: dic("servicioRaw", row),
    tipoServicio: dic("tipoServicio", row),
    regional: dic("regional", row),
    estado,
    tipoCaso: dic("tipoCaso", row),
    prioridad: dic("prioridad", row),
    resultado: dic("resultado", row),
    analista: dic("analista", row),
    tiempoGestion: dias ?? 0,
    cerrada: estado.startsWith("Cerrada"),
    validacionClinica: row[row.length - 2] === 1,
    recurrente: row[row.length - 1] === 1,
  };
});

const uniqOrdenado = (get: (r: PqrsRecord) => string) => {
  const map = new Map<string, number>();
  for (const r of PQRS_DATA) map.set(get(r), (map.get(get(r)) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
};

/** Taxonomía real derivada de los datos: Causa -> Subcausa -> Detalle */
export const TAXONOMIA: Record<string, Record<string, string[]>> = (() => {
  const t: Record<string, Record<string, Set<string>>> = {};
  for (const r of PQRS_DATA) {
    t[r.causa] ??= {};
    t[r.causa][r.subcausa] ??= new Set();
    t[r.causa][r.subcausa].add(r.detalle);
  }
  const out: Record<string, Record<string, string[]>> = {};
  for (const [c, subs] of Object.entries(t)) {
    out[c] = {};
    for (const [s, dets] of Object.entries(subs)) out[c][s] = [...dets].sort();
  }
  return out;
})();

export const CAUSAS = uniqOrdenado((r) => r.causa);
export const subcausasDe = (causa?: string | null) =>
  causa && TAXONOMIA[causa] ? Object.keys(TAXONOMIA[causa]).sort() : [];
export const detallesDe = (causa?: string | null, subcausa?: string | null) =>
  causa && subcausa && TAXONOMIA[causa]?.[subcausa] ? TAXONOMIA[causa][subcausa] : [];

export const TIPOS_SERVICIO = uniqOrdenado((r) => r.tipoServicio);
export const REGIONALES = uniqOrdenado((r) => r.regional);
export const ANALISTAS = uniqOrdenado((r) => r.analista);
export const PRIORIDADES = uniqOrdenado((r) => r.prioridad);

/** Homologación real de servicios: variantes del CRM -> servicio normalizado */
export const HOMOLOGACION: { crm: string; ips: string; casos: number }[] = (() => {
  const map = new Map<string, { ips: string; casos: number }>();
  for (const r of PQRS_DATA) {
    const cur = map.get(r.servicioRaw);
    if (cur) cur.casos += 1;
    else map.set(r.servicioRaw, { ips: r.tipoServicio, casos: 1 });
  }
  return [...map.entries()]
    .map(([crm, v]) => ({ crm, ips: v.ips, casos: v.casos }))
    .sort((a, b) => b.casos - a.casos);
})();

export const PRESTADORES = TIPOS_SERVICIO;

export const HOMOLOGACION_METRICAS = {
  registrosCrm: HOMOLOGACION.length,
  duplicados: HOMOLOGACION.length - TIPOS_SERVICIO.length,
  homologados: TIPOS_SERVICIO.length,
  porcentaje: 100,
};

export const PERIODOS: string[] = [...new Set(PQRS_DATA.map((r) => r.periodo))].sort();

export const MESES_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const etiquetaPeriodo = (p: string) => {
  const [y, m] = p.split("-");
  return `${MESES_ES[Number(m) - 1]} ${y}`;
};

export const RANGO_FECHAS = {
  desde: PQRS_DATA.reduce((a, r) => (r.fecha < a ? r.fecha : a), PQRS_DATA[0].fecha),
  hasta: PQRS_DATA.reduce((a, r) => (r.fecha > a ? r.fecha : a), PQRS_DATA[0].fecha),
};
