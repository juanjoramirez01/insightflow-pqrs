import { CheckCircle2, Clock, FolderOpen, Layers, Repeat } from "lucide-react";
import { KpiCard } from "./KpiCard";
import type { Kpis } from "@/lib/pqrs-metrics";

export function KpiRow({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        label="Total PQRS"
        value={kpis.total.toLocaleString("es-CO")}
        delta={kpis.deltaTotal}
        icon={Layers}
        invertido
      />
      <KpiCard
        label="PQRS abiertas"
        value={kpis.abiertas.toLocaleString("es-CO")}
        delta={kpis.deltaAbiertas}
        icon={FolderOpen}
        invertido
      />
      <KpiCard
        label="PQRS cerradas"
        value={kpis.cerradas.toLocaleString("es-CO")}
        delta={kpis.deltaCerradas}
        icon={CheckCircle2}
      />
      <KpiCard
        label="% de recurrencia"
        value={`${kpis.recurrencia}%`}
        delta={kpis.deltaRecurrencia}
        icon={Repeat}
        invertido
      />
      <KpiCard
        label="Tiempo promedio de gestión"
        value={`${kpis.tiempoPromedio} días`}
        delta={kpis.deltaTiempo}
        icon={Clock}
        invertido
      />
    </div>
  );
}