import { Link, useLocation } from "react-router-dom";
import { Gauge, Activity, Settings, Layers } from "lucide-react";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/admin", label: "Admin", icon: Settings },
  { to: "/protocols", label: "Protocols", icon: Layers },
  { to: "/sentiment", label: "Sentiment", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:block md:w-64 lg:w-72 shrink-0 border-r border-border/60 bg-gradient-to-b from-background to-background/60">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6">
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
