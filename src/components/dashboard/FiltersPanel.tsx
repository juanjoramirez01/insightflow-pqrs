import { Filter, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PERIODOS,
  PRESTADORES,
  REGIONALES,
  TIPOS_SERVICIO,
  CAUSAS,
  detallesDe,
  etiquetaPeriodo,
  subcausasDe,
} from "@/data/pqrs";
import { TODOS, useFiltros, type Filtros } from "@/lib/pqrs-filters";

function FiltroSelect({
  label,
  value,
  options,
  onChange,
  todosLabel,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  todosLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-card">
          <SelectValue placeholder={todosLabel} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={TODOS}>{todosLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const opts = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export function FiltersPanel({ jerarquicos = true }: { jerarquicos?: boolean }) {
  const { filtros, setFiltro, limpiar, activos } = useFiltros();
  const set = (k: keyof Filtros) => (v: string) => setFiltro(k, v);
  const causaSel = filtros.causa === TODOS ? null : filtros.causa;
  const subSel = filtros.subcausa === TODOS ? null : filtros.subcausa;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold">Filtros del análisis</h2>
          {activos > 0 ? (
            <Badge variant="secondary" className="shrink-0">
              {activos} activo{activos > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={limpiar} disabled={activos === 0}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Limpiar filtros
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FiltroSelect
          label="Periodo"
          value={filtros.periodo}
          todosLabel="Últimos 12 meses"
          options={PERIODOS.map((p) => ({ value: p, label: etiquetaPeriodo(p) }))}
          onChange={set("periodo")}
        />
        <FiltroSelect
          label="Regional"
          value={filtros.regional}
          todosLabel="Todas las regionales"
          options={opts(REGIONALES)}
          onChange={set("regional")}
        />
        <FiltroSelect
          label="Tipo de servicio"
          value={filtros.tipoServicio}
          todosLabel="Todos los servicios"
          options={opts(TIPOS_SERVICIO)}
          onChange={set("tipoServicio")}
        />
        <FiltroSelect
          label="Prestador / IPS"
          value={filtros.prestador}
          todosLabel="Todos los prestadores"
          options={opts(PRESTADORES)}
          onChange={set("prestador")}
        />
        {jerarquicos ? (
          <>
            <FiltroSelect
              label="Causa principal"
              value={filtros.causa}
              todosLabel="Todas las causas"
              options={opts(CAUSAS)}
              onChange={set("causa")}
            />
            <FiltroSelect
              label="Subcausa"
              value={filtros.subcausa}
              todosLabel={causaSel ? "Todas las subcausas" : "Selecciona una causa"}
              options={opts(subcausasDe(causaSel))}
              onChange={set("subcausa")}
              disabled={!causaSel}
            />
            <FiltroSelect
              label="Detalle"
              value={filtros.detalle}
              todosLabel={subSel ? "Todos los detalles" : "Selecciona una subcausa"}
              options={opts(detallesDe(causaSel, subSel))}
              onChange={set("detalle")}
              disabled={!subSel}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}