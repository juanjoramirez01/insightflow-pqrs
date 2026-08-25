import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/zoho_crm";
const FIELDS = "First_Name,Last_Name,Email,Phone,Subject,Description,Status,Created_Time,Modified_Time";

type ZohoCase = {
  id: string;
  First_Name?: string | null;
  Last_Name?: string | null;
  Email?: string | null;
  Phone?: string | null;
  Subject?: string | null;
  Description?: string | null;
  Status?: string | null;
  Created_Time?: string | null;
  Modified_Time?: string | null;
};

async function fetchPage(page: number, lovableKey: string, zohoKey: string) {
  const url = `${GATEWAY_URL}/Cases?fields=${encodeURIComponent(FIELDS)}&per_page=200&page=${page}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": zohoKey,
    },
  });

  if (response.status === 204) return { data: [] as ZohoCase[], more: false };

  if (!response.ok) {
    const body = await response.text();
    console.error(`Zoho CRM request failed [${response.status}]: ${body}`);
    throw new Error(`Zoho CRM respondió ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    data?: ZohoCase[];
    info?: { more_records?: boolean };
  };
  return { data: json.data ?? [], more: Boolean(json.info?.more_records) };
}

/** Migra los casos (PQRS) de Zoho CRM a la tabla `pqrs` de la base de datos. */
export const migrarPqrsDesdeZoho = createServerFn({ method: "POST" }).handler(async () => {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const zohoKey = process.env["ZOHO_CRM_API_KEY"];
  if (!lovableKey || !zohoKey) {
    throw new Error("La conexión con Zoho CRM no está configurada en este proyecto.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let page = 1;
  let more = true;
  let total = 0;

  while (more && page <= 50) {
    const { data, more: hasMore } = await fetchPage(page, lovableKey, zohoKey);
    if (data.length === 0) break;

    const rows = data.map((c) => ({
      zoho_id: String(c.id),
      first_name: c.First_Name ?? null,
      last_name: c.Last_Name ?? null,
      email: c.Email ?? null,
      phone: c.Phone ?? null,
      subject: c.Subject ?? null,
      description: c.Description ?? null,
      status: c.Status ?? null,
      zoho_created_time: c.Created_Time ?? null,
      zoho_modified_time: c.Modified_Time ?? null,
      migrated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin.from("pqrs").upsert(rows, { onConflict: "zoho_id" });
    if (error) throw new Error(`Error guardando en la base de datos: ${error.message}`);

    total += rows.length;
    more = hasMore;
    page += 1;
  }

  const { count } = await supabaseAdmin.from("pqrs").select("id", { count: "exact", head: true });

  return { migrados: total, totalEnBase: count ?? 0 };
});
