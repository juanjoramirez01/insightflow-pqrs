import type { ReactNode } from "react";
import { useFiltros } from "@/lib/pqrs-filters";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

export function DemoNotice() {
  const { todos, rangoFechas, actualizadoEn } = useFiltros();
  return (
    <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-foreground">
      <span className="font-semibold">Fuente:</span> datos en vivo de PQRS desde Zoho CRM (
      {todos.length.toLocaleString("es-CO")} casos · {rangoFechas.desde} a {rangoFechas.hasta}).
      {actualizadoEn ? <> Actualizado: {new Date(actualizadoEn).toLocaleString("es-CO")}.</> : null}
    </p>
  );
}
