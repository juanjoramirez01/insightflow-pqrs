import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PQRS_DATA, type PqrsRecord } from "@/data/pqrs";

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

interface Ctx {
  filtros: Filtros;
  setFiltro: (key: keyof Filtros, value: string) => void;
  limpiar: () => void;
  activos: number;
  data: PqrsRecord[];
}

const FiltrosContext = createContext<Ctx | null>(null);

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

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

  const data = useMemo(() => aplicarFiltros(PQRS_DATA, filtros), [filtros]);
  const activos = useMemo(
    () => Object.values(filtros).filter((v) => v !== TODOS).length,
    [filtros],
  );

  return (
    <FiltrosContext.Provider value={{ filtros, setFiltro, limpiar, activos, data }}>
      {children}
    </FiltrosContext.Provider>
  );
}

export function useFiltros() {
  const ctx = useContext(FiltrosContext);
  if (!ctx) throw new Error("useFiltros debe usarse dentro de FiltrosProvider");
  return ctx;
}