// Cliente del endpoint propio /api/crm/pqrs (llamado desde el navegador).
// El backend es el único que habla con Zoho CRM; el frontend solo consume
// el formato ya normalizado que el dashboard espera.
import type { PqrsRecord } from "@/data/pqrs";

export interface PqrsResponse {
  data: PqrsRecord[];
  total: number;
  actualizadoEn: string;
}

export async function fetchPqrsData(): Promise<PqrsResponse> {
  const response = await fetch("/api/crm/pqrs");
  const json = (await response.json()) as {
    exito: boolean;
    data?: PqrsRecord[];
    total?: number;
    actualizadoEn?: string;
    error?: string;
  };

  if (!response.ok || !json.exito) {
    throw new Error(json.error ?? "No se pudieron obtener los PQRS desde Zoho CRM.");
  }

  return { data: json.data ?? [], total: json.total ?? 0, actualizadoEn: json.actualizadoEn ?? "" };
}
