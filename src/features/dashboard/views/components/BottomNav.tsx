import { Plus, Settings, Users } from "lucide-react";

interface BottomNavProps {
  navigate: (path: string) => void;
  currentPath?: string;
}

export function BottomNav({ navigate, currentPath }: BottomNavProps) {
  const navButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white";
  const activeClass = "bg-white/15 text-white";

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 mx-auto flex h-16 max-w-[360px] items-center justify-around rounded-full bg-dark-blue px-5 shadow-2xl shadow-dark-blue/30">
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
        aria-label="Add food"
        title="Add food"
        onClick={() => navigate("/log-food?mode=ai")}
        className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-lg shadow-orange/30 transition-colors hover:bg-cyan"
      >
        <Plus className="h-7 w-7" />
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
    </nav>
  );
}
