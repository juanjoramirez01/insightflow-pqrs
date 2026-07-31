import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  Home,
  Map,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Dashboard PQRS", url: "/dashboard", icon: BarChart3 },
  { title: "Análisis de causas", url: "/causas", icon: Network },
  { title: "Servicios", url: "/servicios", icon: Building2 },
  { title: "Regionales", url: "/regionales", icon: Map },
  { title: "Reportes", url: "/reportes", icon: FileText },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
            Salud Integral
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">Analítica PQRS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
        Datos reales de PQRS · uso interno.
      </div>
    </div>
  );
}