// Dataset DEMOSTRATIVO (ficticio) de PQRS. No corresponde a informacion real.

export type Estado = "Abierta" | "En gestión" | "Cerrada";

export interface PqrsRecord {
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  periodo: string; // yyyy-mm
  causa: string;
  subcausa: string;
  detalle: string;
  tipoServicio: string;
  prestadorCrm: string;
  prestador: string; // IPS homologada
  regional: string;
  estado: Estado;
  tiempoGestion: number; // dias
  recurrente: boolean;
}

export const TAXONOMIA: Record<string, Record<string, string[]>> = {
  "Problemas relacionados con la prestación del servicio": {
    Oportunidad: [
      "Sin agenda",
      "Agenda lejana",
      "No contacto",
      "No devolución de llamada",
      "Reprogramación",
      "Cancelación",
      "Error de agenda",
    ],
    "IPS no presta el servicio": [
      "Servicio no habilitado",
      "Cierre temporal del servicio",
      "Ausencia de especialista",
      "Contrato inactivo",
    ],
    "Entrega de medicamentos, dispositivos e insumos": [
      "Entrega parcial",
      "Sin existencias",
      "Demora en la entrega",
      "Insumo no disponible en red",
    ],
  },
  "Problemas relacionados con autorizaciones": {
    "Error en autorización": [
      "Error en CUPS",
      "Error en direccionamiento",
      "Cantidad incorrecta",
      "Datos faltantes",
      "Separación de servicios",
    ],
    "Sin autorización": [
      "Soportes insuficientes",
      "Sin justificación",
      "Orden médica o fórmula vencida",
      "Inconveniente con MIPRES",
      "SAS cerrado",
      "SAS pendiente",
      "Exclusión PBS",
      "Otros definidos por la operación",
    ],
  },
  "Problemas relacionados con la atención al usuario": {
    "Trato del personal": ["Trato descortés", "Información incompleta", "Demora en ventanilla"],
    "Canales de atención": [
      "Línea telefónica saturada",
      "Sin respuesta en canal digital",
      "Portal web no disponible",
    ],
  },
  "Problemas administrativos y de afiliación": {
    "Afiliación y novedades": [
      "Novedad no aplicada",
      "Datos desactualizados",
      "Traslado no efectivo",
    ],
    "Facturación y cobros": [
      "Cobro de copago indebido",
      "Factura errada",
      "Devolución de dinero pendiente",
    ],
  },
};

export const CAUSAS = Object.keys(TAXONOMIA);
export const subcausasDe = (causa?: string | null) =>
  causa && TAXONOMIA[causa] ? Object.keys(TAXONOMIA[causa]) : [];
export const detallesDe = (causa?: string | null, subcausa?: string | null) =>
  causa && subcausa && TAXONOMIA[causa]?.[subcausa] ? TAXONOMIA[causa][subcausa] : [];

export const TIPOS_SERVICIO = [
  "Consulta externa",
  "Urgencias",
  "Hospitalización",
  "Ayudas diagnósticas",
  "Cirugía programada",
  "Medicamentos",
  "Odontología",
  "Terapias",
];

export const REGIONALES = [
  "Bogotá D.C.",
  "Antioquia",
  "Caribe",
  "Centro Oriente",
  "Eje Cafetero",
  "Occidente",
];

/** Registros CRM -> IPS homologada (dispersion de nomenclatura) */
export const HOMOLOGACION: { crm: string; ips: string }[] = [
  { crm: "Clínica ABC SAS", ips: "Clínica ABC" },
  { crm: "CLINICA ABC", ips: "Clínica ABC" },
  { crm: "Clínica ABC S.A.S.", ips: "Clínica ABC" },
  { crm: "IPS ABC", ips: "Clínica ABC" },
  { crm: "Hospital San Rafael E.S.E", ips: "Hospital San Rafael" },
  { crm: "HOSPITAL SAN RAFAEL", ips: "Hospital San Rafael" },
  { crm: "H. San Rafael ESE", ips: "Hospital San Rafael" },
  { crm: "Centro Médico Los Andes SAS", ips: "Centro Médico Los Andes" },
  { crm: "CM LOS ANDES", ips: "Centro Médico Los Andes" },
  { crm: "Centro Medico Los Andes", ips: "Centro Médico Los Andes" },
  { crm: "Unidad Salud Integral IPS", ips: "Unidad Salud Integral" },
  { crm: "UNIDAD SALUD INTEGRAL S.A.S", ips: "Unidad Salud Integral" },
  { crm: "Fundación Clínica del Norte", ips: "Clínica del Norte" },
  { crm: "CLINICA DEL NORTE SAS", ips: "Clínica del Norte" },
  { crm: "Red Vital IPS S.A.S.", ips: "Red Vital IPS" },
  { crm: "RED VITAL", ips: "Red Vital IPS" },
  { crm: "Instituto Cardiovascular del Sur", ips: "Instituto Cardiovascular del Sur" },
  { crm: "Clínica Santa Lucía Ltda", ips: "Clínica Santa Lucía" },
  { crm: "CLINICA SANTA LUCIA", ips: "Clínica Santa Lucía" },
  { crm: "Médicos Asociados IPS", ips: "Médicos Asociados" },
];

export const PRESTADORES = Array.from(new Set(HOMOLOGACION.map((h) => h.ips)));

export const HOMOLOGACION_METRICAS = {
  registrosCrm: HOMOLOGACION.length,
  duplicados: HOMOLOGACION.length - PRESTADORES.length,
  homologados: PRESTADORES.length,
  porcentaje: 100,
};

// ---------- generacion determinista ----------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260731);
const pick = <T,>(arr: T[], weights?: number[]): T => {
  if (!weights) return arr[Math.floor(rand() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
};

export const PERIODOS: string[] = (() => {
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 6 - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
})();

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

const causaPesos = [40, 30, 18, 12];
const estadoPesos: [Estado, number][] = [
  ["Cerrada", 62],
  ["En gestión", 24],
  ["Abierta", 14],
];

function generar(): PqrsRecord[] {
  const registros: PqrsRecord[] = [];
  let n = 0;
  PERIODOS.forEach((periodo, idx) => {
    const base = 95 + Math.round(idx * 3.5 + rand() * 25);
    for (let i = 0; i < base; i++) {
      const causa = pick(CAUSAS, causaPesos);
      const subs = subcausasDe(causa);
      const subcausa = pick(subs, subs.map((_, j) => 100 - j * 22));
      const dets = detallesDe(causa, subcausa);
      const detalle = pick(dets, dets.map((_, j) => 100 - j * 9));
      const crm = pick(HOMOLOGACION, HOMOLOGACION.map((_, j) => 100 - j * 3.5));
      const estado = pick(
        estadoPesos.map((e) => e[0]),
        estadoPesos.map((e) => e[1]),
      );
      const dia = 1 + Math.floor(rand() * 28);
      n += 1;
      registros.push({
        id: `PQRS-${String(n).padStart(5, "0")}`,
        fecha: `${periodo}-${String(dia).padStart(2, "0")}`,
        periodo,
        causa,
        subcausa,
        detalle,
        tipoServicio: pick(TIPOS_SERVICIO, [100, 62, 40, 78, 45, 88, 26, 30]),
        prestadorCrm: crm.crm,
        prestador: crm.ips,
        regional: pick(REGIONALES, [100, 78, 62, 48, 38, 55]),
        estado,
        tiempoGestion: Math.round((2 + rand() * 18) * 10) / 10,
        recurrente: rand() < 0.31,
      });
    }
  });
  return registros;
}

export const PQRS_DATA: PqrsRecord[] = generar();