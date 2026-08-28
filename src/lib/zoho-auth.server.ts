// Autenticación OAuth2 server-side con Zoho CRM (refresh_token -> access_token).
// El navegador nunca ve ZOHO_CLIENT_ID/ZOHO_CLIENT_SECRET/ZOHO_REFRESH_TOKEN: solo se leen aquí,
// en un módulo .server.ts que TanStack Start no incluye en el bundle del cliente.

const ACCOUNTS_DOMAIN = process.env["ZOHO_ACCOUNTS_DOMAIN"] || "https://accounts.zoho.com";
const API_DOMAIN = process.env["ZOHO_API_DOMAIN"] || "https://www.zohoapis.com";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;
let inFlight: Promise<string> | null = null;

async function requestAccessToken(): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = process.env["ZOHO_CLIENT_ID"];
  const clientSecret = process.env["ZOHO_CLIENT_SECRET"];
  const refreshToken = process.env["ZOHO_REFRESH_TOKEN"];

  const missing = [
    !clientId && "ZOHO_CLIENT_ID",
    !clientSecret && "ZOHO_CLIENT_SECRET",
    !refreshToken && "ZOHO_REFRESH_TOKEN",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(
      `Zoho CRM no está configurado. Faltan variables de entorno: ${missing.join(", ")}.`,
    );
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId!,
    client_secret: clientSecret!,
    refresh_token: refreshToken!,
  });

  const response = await fetch(`${ACCOUNTS_DOMAIN}/oauth/v2/token?${params.toString()}`, {
    method: "POST",
  });

  const json = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!response.ok || !json.access_token) {
    // No se registran client_secret/refresh_token; solo el código de error de Zoho.
    throw new Error(
      `No se pudo obtener el access token de Zoho CRM (${json.error ?? response.status}).`,
    );
  }

  return { accessToken: json.access_token, expiresIn: json.expires_in ?? 3600 };
}

/** Devuelve un access token de Zoho válido, renovándolo solo cuando expiró (o va a expirar en <30s). */
export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.accessToken;

  if (!inFlight) {
    inFlight = requestAccessToken()
      .then(({ accessToken, expiresIn }) => {
        cachedToken = { accessToken, expiresAt: Date.now() + expiresIn * 1000 };
        return accessToken;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function zohoApiDomain() {
  return API_DOMAIN;
}
