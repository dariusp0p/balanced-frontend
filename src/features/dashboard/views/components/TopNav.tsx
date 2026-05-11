import {
  Flame,
  Cloud,
  RefreshCw,
  Check,
  X,
  Home,
  Users,
  Settings,
} from "lucide-react";

interface TopNavProps {
  streakDays: number;
  connectionStatus: "offline" | "syncing" | "synced";
  navigate: (path: string) => void;
  currentPath: string;
}

function ConnectionIndicator({
  status,
}: {
  status: "offline" | "syncing" | "synced";
}) {
  const label =
    status === "offline"
      ? "Offline"
      : status === "syncing"
        ? "Syncing"
        : "In sync";

  const iconClass =
    status === "offline"
      ? "text-red-300"
      : status === "syncing"
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"
      title={label}
      aria-label={`Connection status: ${label}`}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <Cloud className={`w-4 h-4 ${iconClass}`} />
        {status === "offline" && (
          <X className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-red-200" />
        )}
        {status === "syncing" && (
          <RefreshCw className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-amber-100 animate-spin" />
        )}
        {status === "synced" && (
          <Check className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-emerald-100" />
        )}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function TopNav({
  streakDays,
  connectionStatus,
  navigate,
  currentPath,
}: TopNavProps) {
  const linkClass =
    "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white";
  const activeClass = "bg-white/15 text-white";

  return (
    <header className="hidden bg-dark-blue px-6 py-4 text-white lg:block">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <nav className="flex items-center gap-2">
          <button
            type="button"
            className={`${linkClass} ${currentPath === "/dashboard" ? activeClass : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={`${linkClass} ${currentPath === "/friends" ? activeClass : ""}`}
            onClick={() => navigate("/friends")}
          >
            <Users className="h-4 w-4" />
            <span>Friends</span>
          </button>
          <button
            type="button"
            className={`${linkClass} ${currentPath === "/settings" ? activeClass : ""}`}
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>

        <h1 className="justify-self-center text-xl font-semibold">Balanced</h1>

        <div className="flex items-center justify-end gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
            <Flame className="h-4 w-4 fill-orange text-orange" />
            <span className="text-sm font-semibold">{streakDays}</span>
          </div>
          <ConnectionIndicator status={connectionStatus} />
        </div>
      </div>
    </header>
  );
}
