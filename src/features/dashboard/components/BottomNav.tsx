import { Home, Camera, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";

interface BottomNavProps {
  navigate: (path: string) => void;
}

export function BottomNav({ navigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-blue px-6 py-4 flex items-center justify-around">
      <button
        className="text-white hover:text-cyan transition-colors"
        onClick={() => navigate("/dashboard")}
      >
        <Home className="w-6 h-6" />
      </button>
      <button
        onClick={() => navigate("/log-food?mode=ai")}
        className="w-14 h-14 rounded-full bg-orange flex items-center justify-center hover:bg-cyan transition-colors -mt-8"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-white">
            <User className="w-6 h-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/")}
            className="text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
