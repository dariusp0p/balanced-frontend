import {
  Check,
  Cloud,
  Flame,
  Home,
  Plus,
  RefreshCw,
  Settings,
  Users,
  X,
} from "lucide-react";

interface BottomNavProps {
  navigate: (path: string) => void;
  currentPath?: string;
  streakDays?: number;
  connectionStatus?: "offline" | "syncing" | "synced";
}

function StatusIndicator({
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
      className="flex h-11 w-11 items-center justify-center rounded-full text-white/75"
      title={label}
      aria-label={`Connection status: ${label}`}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <Cloud className={`h-5 w-5 ${iconClass}`} />
        {status === "offline" && (
          <X className="absolute -bottom-1 -right-1 h-3 w-3 text-red-200" />
        )}
        {status === "syncing" && (
          <RefreshCw className="absolute -bottom-1 -right-1 h-3 w-3 animate-spin text-amber-100" />
        )}
        {status === "synced" && (
          <Check className="absolute -bottom-1 -right-1 h-3 w-3 text-emerald-100" />
        )}
      </span>
    </div>
  );
}

export function BottomNav({
  navigate,
  currentPath,
  streakDays = 12,
  connectionStatus = "synced",
}: BottomNavProps) {
  const navButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white";
  const activeClass = "bg-white/15 text-white";
  const isDashboard = currentPath === "/dashboard";

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 mx-auto grid h-16 max-w-[400px] grid-cols-5 items-center justify-items-center rounded-full bg-dark-blue px-4 shadow-2xl shadow-dark-blue/30">
      <div
        className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-1.5 text-white"
        title={`${streakDays} day streak`}
        aria-label={`${streakDays} day streak`}
      >
        <Flame className="h-5 w-5 fill-orange text-orange" />
        <span className="text-sm font-semibold">{streakDays}</span>
      </div>

      <button
        type="button"
        aria-label="Friends"
        title="Friends"
        className={`${navButtonClass} ${currentPath === "/friends" ? activeClass : ""}`}
        onClick={() => navigate("/friends")}
      >
        <Users className="h-6 w-6" />
      </button>

      <button
        type="button"
        aria-label={isDashboard ? "Add food" : "Home"}
        title={isDashboard ? "Add food" : "Home"}
        onClick={() => navigate(isDashboard ? "/log-food?mode=ai" : "/dashboard")}
        className={
          isDashboard
            ? "-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-lg shadow-orange/30 transition-colors hover:bg-cyan hover:shadow-cyan/30"
            : navButtonClass
        }
      >
        {isDashboard ? (
          <Plus className="h-7 w-7" />
        ) : (
          <Home className="h-6 w-6" />
        )}
      </button>

      <button
        type="button"
        aria-label="Settings"
        title="Settings"
        className={`${navButtonClass} ${currentPath === "/settings" ? activeClass : ""}`}
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-6 w-6" />
      </button>

      <StatusIndicator status={connectionStatus} />
    </nav>
  );
}
