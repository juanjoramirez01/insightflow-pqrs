import { createServerFn } from "@tanstack/react-start";

/** Migra los casos (PQRS) de Zoho CRM a la tabla `pqrs` de la base de datos. */
export const migrarPqrsDesdeZoho = createServerFn({ method: "POST" }).handler(async () => {
  const { runZohoMigration } = await import("./zoho-migration.server");
  return runZohoMigration();
});
