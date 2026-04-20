import {
  Flame,
  User,
  Settings,
  LogOut,
  Cloud,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";

interface TopNavProps {
  streakDays: number;
  connectionStatus: "offline" | "syncing" | "synced";
  onSettings: () => void;
  onLogout: () => void;
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
      className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full"
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
  onSettings,
  onLogout,
}: TopNavProps) {
  return (
    <header className="bg-dark-blue text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Balanced</h1>
      <div className="flex items-center gap-3">
        <ConnectionIndicator status={connectionStatus} />
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-orange fill-orange" />
          <span className="text-sm font-semibold">{streakDays}</span>
        </div>
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <User className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
