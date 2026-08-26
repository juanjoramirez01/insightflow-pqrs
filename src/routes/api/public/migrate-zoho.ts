import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const expected = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const provided =
    request.headers.get("apikey") ??
    /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1];

  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ exito: false, error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { runZohoMigration } = await import("@/lib/zoho-migration.server");
    const resultado = await runZohoMigration();
    return Response.json({ exito: true, ...resultado });
  } catch (error) {
    console.error("Migración Zoho falló:", error);
    return Response.json(
      { exito: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/public/migrate-zoho")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
