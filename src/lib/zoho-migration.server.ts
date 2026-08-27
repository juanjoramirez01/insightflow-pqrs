const GATEWAY_URL = "https://connector-gateway.lovable.dev/zoho_crm";
// Campos reales del módulo PQRS (obtenidos de settings/fields)
const FIELDS = [
  "Name",
  "N_mero_del_caso",
  "Estado",
  "Causa",
  "Motivos",
  "Tipo_de_caso",
  "Descripci_n",
  "Nombre_del_contacto",
  "Regional_EPS",
  "Tipo_Servicio",
  "Detalle_Operativo",
  "Prioridad",
  "Fecha_de_apertura_PQR",
  "Fecha_de_cierre",
  "Created_Time",
  "Modified_Time",
].join(",");

type ZohoLookup = { name?: string | null } | string | null | undefined;

type ZohoCase = {
  id: string;
  Name?: string | null;
  N_mero_del_caso?: string | null;
  Estado?: string | null;
  Causa?: string | null;
  Descripci_n?: string | null;
  Nombre_del_contacto?: ZohoLookup;
  Tipo_Servicio?: string | null;
  Created_Time?: string | null;
  Modified_Time?: string | null;
};

function lookupName(value: ZohoLookup): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.name ?? null;
}

function ms(start: number) {
  return `${Math.round(performance.now() - start)}ms`;
}

async function fetchPage(pageToken: string | null, lovableKey: string, zohoKey: string) {
  const params = new URLSearchParams({ fields: FIELDS, per_page: "200" });
  if (pageToken) params.set("page_token", pageToken);

  const t0 = performance.now();
  console.log(`[zoho] fetchPage -> solicitando (page_token=${pageToken ?? "inicial"})`);

  const response = await fetch(`${GATEWAY_URL}/PQRS?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": zohoKey,
    },
  });

  if (response.status === 204) return { data: [] as ZohoCase[], nextToken: null as string | null };

  if (!response.ok) {
    const body = await response.text();
    console.error(`Zoho CRM request failed [${response.status}]: ${body}`);
    throw new Error(`Zoho CRM respondió ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    data?: ZohoCase[];
    info?: { more_records?: boolean; next_page_token?: string };
  };
  const more = Boolean(json.info?.more_records);
  return {
    data: json.data ?? [],
    nextToken: more ? (json.info?.next_page_token ?? null) : null,
  };
}

/** Trae los registros del módulo PQRS de Zoho CRM y los guarda/actualiza en la tabla `pqrs`. */
export async function runZohoMigration() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const zohoKey = process.env["ZOHO_CRM_API_KEY"];
  if (!lovableKey || !zohoKey) {
    throw new Error("La conexión con Zoho CRM no está configurada en este proyecto.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let pageToken: string | null = null;
  let pages = 0;
  let total = 0;

  do {
    const { data, nextToken } = await fetchPage(pageToken, lovableKey, zohoKey);
    pageToken = nextToken;
    pages += 1;
    if (data.length === 0) break;

    const rows = data.map((c) => ({
      zoho_id: String(c.id),
      first_name: lookupName(c.Nombre_del_contacto),
      last_name: c.N_mero_del_caso != null ? String(c.N_mero_del_caso) : null,
      email: c.Causa ?? null,
      phone: c.Tipo_Servicio ?? null,
      subject: c.Name ?? null,
      description: c.Descripci_n ?? null,
      status: c.Estado ?? null,
      zoho_created_time: c.Created_Time ?? null,
      zoho_modified_time: c.Modified_Time ?? null,
      migrated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin.from("pqrs").upsert(rows, { onConflict: "zoho_id" });
    if (error) throw new Error(`Error guardando en la base de datos: ${error.message}`);

    total += rows.length;
  } while (pageToken && pages <= 500);

  const { count } = await supabaseAdmin.from("pqrs").select("id", { count: "exact", head: true });

  return { migrados: total, totalEnBase: count ?? 0 };
}
