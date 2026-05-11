import {
  Flame,
  Cloud,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

interface TopNavProps {
  streakDays: number;
  connectionStatus: "offline" | "syncing" | "synced";
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
}: TopNavProps) {
  return (
    <header className="bg-dark-blue px-4 py-4 text-white">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Balanced</h1>
        <ConnectionIndicator status={connectionStatus} />
        {/* Streak Counter */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
          <Flame className="w-4 h-4 text-orange fill-orange" />
          <span className="text-sm font-semibold">{streakDays}</span>
        </div>
      </div>
    </header>
  );
}
