import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import type { PqrsRecord } from "@/data/pqrs";
import { fetchPqrsData } from "@/lib/pqrs-fetch";
import { computeCatalog, type PqrsCatalog } from "@/lib/pqrs-derived";
import { Button } from "@/components/ui/button";

export interface Filtros {
  periodo: string; // "todos" | yyyy-mm
  causa: string;
  subcausa: string;
  detalle: string;
  tipoServicio: string;
  analista: string;
  regional: string;
}

export const TODOS = "todos";

export const FILTROS_INICIALES: Filtros = {
  periodo: TODOS,
  causa: TODOS,
  subcausa: TODOS,
  detalle: TODOS,
  tipoServicio: TODOS,
  analista: TODOS,
  regional: TODOS,
};

export function aplicarFiltros(data: PqrsRecord[], f: Filtros): PqrsRecord[] {
  return data.filter(
    (r) =>
      (f.periodo === TODOS || r.periodo === f.periodo) &&
      (f.causa === TODOS || r.causa === f.causa) &&
      (f.subcausa === TODOS || r.subcausa === f.subcausa) &&
      (f.detalle === TODOS || r.detalle === f.detalle) &&
      (f.tipoServicio === TODOS || r.tipoServicio === f.tipoServicio) &&
      (f.analista === TODOS || r.analista === f.analista) &&
      (f.regional === TODOS || r.regional === f.regional),
  );
}

interface Ctx extends PqrsCatalog {
  filtros: Filtros;
  setFiltro: (key: keyof Filtros, value: string) => void;
  limpiar: () => void;
  activos: number;
  data: PqrsRecord[]; // filtrado
  todos: PqrsRecord[]; // sin filtrar
  actualizadoEn: string;
}

const FiltrosContext = createContext<Ctx | null>(null);

const REFRESH_MS = 60 * 60 * 1000; // 60 minutos, según lo pedido: refresco automático del dashboard

function PantallaCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando datos de PQRS desde Zoho CRM…</p>
      </div>
    </div>
  );
}

function PantallaError({ mensaje, onRetry }: { mensaje: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">No se pudieron cargar los PQRS</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mensaje}</p>
        <Button className="mt-6" onClick={onRetry}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const query = useQuery({
    queryKey: ["pqrs"],
    queryFn: fetchPqrsData,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
  });

  const setFiltro = useCallback((key: keyof Filtros, value: string) => {
    setFiltros((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "causa") {
        next.subcausa = TODOS;
        next.detalle = TODOS;
      }
      if (key === "subcausa") next.detalle = TODOS;
      return next;
    });
  }, []);

  const limpiar = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  const todos = useMemo(() => query.data?.data ?? [], [query.data]);
  const data = useMemo(() => aplicarFiltros(todos, filtros), [todos, filtros]);
  const activos = useMemo(
    () => Object.values(filtros).filter((v) => v !== TODOS).length,
    [filtros],
  );
  const catalog = useMemo(() => computeCatalog(todos), [todos]);

  if (query.isLoading) return <PantallaCarga />;
  if (query.isError) {
    return (
      <PantallaError
        mensaje={query.error instanceof Error ? query.error.message : "Error desconocido."}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <FiltrosContext.Provider
      value={{
        filtros,
        setFiltro,
        limpiar,
        activos,
        data,
        todos,
        actualizadoEn: query.data?.actualizadoEn ?? "",
        ...catalog,
      }}
    >
      {children}
    </FiltrosContext.Provider>
  );
}

export function useFiltros() {
  const ctx = useContext(FiltrosContext);
  if (!ctx) throw new Error("useFiltros debe usarse dentro de FiltrosProvider");
  return ctx;
}
