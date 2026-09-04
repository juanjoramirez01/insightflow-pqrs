// Tipos y helpers puros del dominio PQRS.
// Los datos ya no vienen de un JSON estático: se obtienen en vivo desde
// Zoho CRM a través de /api/crm/pqrs (ver src/lib/pqrs-fetch.ts y
// src/lib/pqrs-filters.tsx, que exponen el catálogo derivado por contexto).

export type Estado =
  "Cerrada" | "Cerrada por otra área" | "Transferida" | "En seguimiento" | "Sin iniciar";

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
  descripcion: string;
  medioRecepcion: string;
  servicioEspecifico: string;
  categoriaServicioEspecifico: string;
  edad: number | null;
  fechaVencimiento: string | null; // ISO yyyy-mm-dd, fecha límite de gestión (SLA)
  fechaCierre: string | null; // ISO yyyy-mm-dd, null si sigue abierta
}

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
