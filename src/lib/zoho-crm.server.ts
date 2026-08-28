// Cliente server-side de Zoho CRM: trae todos los PQRS del módulo configurado,
// pagina, mapea los campos del CRM al shape que ya usa el dashboard y cachea
// el resultado en memoria por un tiempo corto para no golpear la API de Zoho
// (ni sus límites de créditos) en cada carga de página de cada usuario.
import { getZohoAccessToken, zohoApiDomain } from "@/lib/zoho-auth.server";
import type { Estado, PqrsRecord } from "@/data/pqrs";

const MODULE = process.env["ZOHO_CRM_MODULE"] || "PQRS";
const PER_PAGE = 200;
const PAGE_CONCURRENCY = 8;
const MAX_PAGES = 300; // guarda de seguridad (~60.000 registros); no es un límite de producto
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

const FIELDS = [
  "Name",
  "N_mero_del_caso",
  "N_mero_Doc",
  "Estado",
  "Causa",
  "Sub_Clasificaci_n",
  "Detalle_Operativo",
  "Descripci_n",
  "Motivos",
  "Tipo_de_caso",
  "Tipo_Servicio",
  "Servicio_Especifico",
  "Medio_recepcion",
  "Regional_EPS",
  "Prioridad",
  "Owner",
  "Requiere_Validacion_Clinica",
  "Edad",
  "Fecha_de_apertura_PQR",
  "Fecha_de_cierre",
  "Created_Time",
  "Modified_Time",
].join(",");

type ZohoLookup = { name?: string | null } | string | null | undefined;

interface ZohoCase {
  id: string;
  N_mero_del_caso?: string | null;
  N_mero_Doc?: string | null;
  Estado?: string | null;
  Causa?: string | null;
  Sub_Clasificaci_n?: string | null;
  Detalle_Operativo?: string | null;
  Descripci_n?: string | null;
  Motivos?: string | null;
  Tipo_de_caso?: string | null;
  Tipo_Servicio?: string | null;
  Servicio_Especifico?: string | null;
  Medio_recepcion?: string | null;
  Regional_EPS?: ZohoLookup;
  Prioridad?: string | null;
  Owner?: ZohoLookup;
  Requiere_Validacion_Clinica?: boolean | string | null;
  Edad?: number | string | null;
  Fecha_de_apertura_PQR?: string | null;
  Fecha_de_cierre?: string | null;
  Created_Time?: string | null;
  Modified_Time?: string | null;
}

function lookupName(value: ZohoLookup): string {
  if (!value) return "Sin asignar";
  if (typeof value === "string") return value;
  return value.name ?? "Sin asignar";
}

const ANIO_MINIMO_VALIDO = 2020; // guarda contra fechas centinela/corruptas vistas en datos reales (p.ej. 1960-11-30)

function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const fecha = value.slice(0, 10);
  const anio = Number(fecha.slice(0, 4));
  if (!Number.isFinite(anio) || anio < ANIO_MINIMO_VALIDO) return null;
  return fecha;
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: boolean | string | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["true", "si", "sí", "1", "yes"].includes(value.trim().toLowerCase());
  return false;
}

/**
 * Normaliza el tipo de caso solo para los valores explícitamente indicados
 * (PETICION -> Petición, QUEJA -> Queja); cualquier otro valor se conserva
 * tal como llega de Zoho para no inventar categorías que no existen.
 */
function normalizarTipoCaso(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  const upper = raw.toUpperCase();
  if (upper === "PETICION" || upper === "PETICIÓN") return "Petición";
  if (upper === "QUEJA") return "Queja";
  return raw || "Sin clasificar";
}

const ESTADOS_VALIDOS: Estado[] = [
  "Cerrada",
  "Cerrada por otra área",
  "Transferida",
  "En seguimiento",
  "Sin iniciar",
];

/**
 * Mapeo verificado contra los valores reales del picklist "Estado" del módulo
 * PQRS en Zoho (distintos de las etiquetas que ya usaba el dashboard con el
 * CSV histórico). "Mal radicado" se homologó como "Transferida" por ser la
 * categoría más cercana (un caso mal radicado se reasigna); confirmar con
 * negocio si debería tratarse distinto (p.ej. como cerrada/inválida).
 */
const MAPA_ESTADOS: Record<string, Estado> = {
  cerrado: "Cerrada",
  "cierre a favor del cliente": "Cerrada",
  "cierre aclarando al cliente": "Cerrada",
  "gestionado – cierre por otra área": "Cerrada por otra área",
  "gestionado - cierre por otra area": "Cerrada por otra área",
  "se transfiere a otra cola": "Transferida",
  "mal radicado": "Transferida",
  seguimiento: "En seguimiento",
};

function normalizarEstado(value: string | null | undefined): Estado {
  const raw = (value ?? "").trim();
  const lower = raw.toLowerCase();
  const directo = ESTADOS_VALIDOS.find((e) => e.toLowerCase() === lower);
  if (directo) return directo;

  const mapeado = MAPA_ESTADOS[lower];
  if (mapeado) return mapeado;

  console.warn(`[zoho-crm] Estado no reconocido, se usa tal cual: "${raw}"`);
  return (raw || "Sin iniciar") as Estado;
}

function diasEntre(desde: string | null, hasta: string | null): number {
  if (!desde || !hasta) return 0;
  const d1 = new Date(desde).getTime();
  const d2 = new Date(hasta).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.max(0, Math.round((d2 - d1) / 86_400_000));
}

async function fetchPage(
  page: number,
  accessToken: string,
): Promise<{ records: ZohoCase[]; moreRecords: boolean }> {
  const params = new URLSearchParams({
    fields: FIELDS,
    page: String(page),
    per_page: String(PER_PAGE),
  });

  const response = await fetch(`${zohoApiDomain()}/crm/v2/${MODULE}?${params.toString()}`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (response.status === 204) return { records: [], moreRecords: false };

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoho CRM respondió ${response.status} en la página ${page}: ${body}`);
  }

  const json = (await response.json()) as {
    data?: ZohoCase[];
    info?: { more_records?: boolean };
  };
  return { records: json.data ?? [], moreRecords: Boolean(json.info?.more_records) };
}

/** Trae TODAS las páginas del módulo, en lotes concurrentes para reducir el tiempo total de la petición. */
async function fetchAllRaw(accessToken: string): Promise<ZohoCase[]> {
  const all: ZohoCase[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const batch = Array.from({ length: PAGE_CONCURRENCY }, (_, i) => page + i);
    const results = await Promise.all(batch.map((p) => fetchPage(p, accessToken)));

    for (const r of results) all.push(...r.records);

    const reachedEnd = results.some((r) => r.records.length < PER_PAGE);
    if (reachedEnd) break;

    page += PAGE_CONCURRENCY;
  }

  if (page > MAX_PAGES) {
    console.warn(
      `[zoho-crm] Se alcanzó el límite de seguridad de ${MAX_PAGES} páginas; puede haber registros sin traer.`,
    );
  }

  return all;
}

function mapear(casos: ZohoCase[]): PqrsRecord[] {
  // Recurrencia: mismo número de documento apareciendo más de una vez en el conjunto traído.
  const conteoDocumentos = new Map<string, number>();
  for (const c of casos) {
    const doc = c.N_mero_Doc ?? "";
    if (doc) conteoDocumentos.set(doc, (conteoDocumentos.get(doc) ?? 0) + 1);
  }

  return casos.map((c) => {
    const fecha = toDateOnly(c.Fecha_de_apertura_PQR) ?? toDateOnly(c.Created_Time) ?? "";
    const fechaCierre = toDateOnly(c.Fecha_de_cierre);
    const estado = normalizarEstado(c.Estado);
    const servicioRaw = c.Tipo_Servicio ?? "Sin especificar";
    const doc = c.N_mero_Doc ?? "";

    return {
      id: c.N_mero_del_caso ?? c.id,
      fecha,
      periodo: fecha ? fecha.slice(0, 7) : "",
      causa: c.Causa ?? "Sin causa",
      subcausa: c.Sub_Clasificaci_n ?? "Sin subcausa",
      detalle: c.Detalle_Operativo ?? "Sin detalle",
      servicioRaw,
      // Sin una tabla de homologación validada contra datos reales de Zoho,
      // se usa el valor del CRM tal cual; homologar es un paso posterior
      // una vez se revisen las variantes reales que devuelve el módulo.
      tipoServicio: servicioRaw,
      regional: lookupName(c.Regional_EPS),
      estado,
      tipoCaso: normalizarTipoCaso(c.Tipo_de_caso),
      prioridad: c.Prioridad ?? "Sin prioridad",
      resultado: c.Motivos ?? "",
      analista: lookupName(c.Owner),
      tiempoGestion: fechaCierre ? diasEntre(fecha, fechaCierre) : 0,
      cerrada: estado.startsWith("Cerrada"),
      validacionClinica: toBoolean(c.Requiere_Validacion_Clinica),
      recurrente: doc ? (conteoDocumentos.get(doc) ?? 0) > 1 : false,
      descripcion: c.Descripci_n ?? "",
      medioRecepcion: c.Medio_recepcion ?? "Sin especificar",
      servicioEspecifico: c.Servicio_Especifico ?? "",
      edad: toNumberOrNull(c.Edad),
    } satisfies PqrsRecord;
  });
}

let cache: { data: PqrsRecord[]; fetchedAt: number } | null = null;
let inFlight: Promise<PqrsRecord[]> | null = null;

async function fetchFresh(): Promise<PqrsRecord[]> {
  const accessToken = await getZohoAccessToken();
  const raw = await fetchAllRaw(accessToken);
  return mapear(raw);
}

/** Devuelve los PQRS vivos desde Zoho CRM, sirviendo desde caché en memoria si está vigente. */
export async function getPqrsFromZoho(options: { force?: boolean } = {}): Promise<{
  data: PqrsRecord[];
  total: number;
  cacheado: boolean;
  actualizadoEn: string;
}> {
  const now = Date.now();
  if (!options.force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      data: cache.data,
      total: cache.data.length,
      cacheado: true,
      actualizadoEn: new Date(cache.fetchedAt).toISOString(),
    };
  }

  if (!inFlight) {
    inFlight = fetchFresh()
      .then((data) => {
        cache = { data, fetchedAt: Date.now() };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  const data = await inFlight;
  return { data, total: data.length, cacheado: false, actualizadoEn: new Date().toISOString() };
}
