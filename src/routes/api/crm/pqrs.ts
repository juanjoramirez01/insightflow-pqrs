import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const force = new URL(request.url).searchParams.get("force") === "1";

  try {
    const { getPqrsFromZoho } = await import("@/lib/zoho-crm.server");
    const { data, total, cacheado, actualizadoEn } = await getPqrsFromZoho({ force });
    return Response.json({ exito: true, data, total, cacheado, actualizadoEn });
  } catch (error) {
    console.error("No se pudieron obtener los PQRS desde Zoho CRM:", error);
    return Response.json(
      { exito: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 502 },
    );
  }
}

export const Route = createFileRoute("/api/crm/pqrs")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
    },
  },
});
