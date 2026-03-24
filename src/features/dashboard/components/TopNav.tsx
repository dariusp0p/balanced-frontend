import { Flame, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";

interface TopNavProps {
  streakDays: number;
  onSettings: () => void;
  onLogout: () => void;
}

export function TopNav({ streakDays, onSettings, onLogout }: TopNavProps) {
  return (
    <header className="bg-dark-blue text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Balanced</h1>
      <div className="flex items-center gap-3">
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
