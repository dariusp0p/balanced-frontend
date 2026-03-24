import {
  Home,
  Camera,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router";
import { CalorieTracker } from "./calorie-tracker";
import { MacroDisplay } from "./macro-display";
import { FoodLogItem } from "./food-log-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useState } from "react";

export function DashboardPage() {
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const streakDays = 12; // Mock streak data

  const foodLogs = [
    {
      id: 1,
      name: "Avocado Toast & Eggs",
      time: "10:48",
      calories: 438,
      protein: 186,
      carbs: 198,
      fats: 78,
    },
    {
      id: 2,
      name: "Avocado Toast & Eggs",
      time: "10:48",
      calories: 438,
      protein: 186,
      carbs: 198,
      fats: 78,
    },
    {
      id: 3,
      name: "Avocado Toast & Eggs",
      time: "10:48",
      calories: 438,
      protein: 186,
      carbs: 198,
      fats: 78,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Balanced</h1>
        <div className="flex items-center gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-[#FF6B35] fill-[#FF6B35]" />
            <span className="text-sm font-semibold">{streakDays}</span>
          </div>

          <button
            onClick={() => navigate("/camera")}
            className="w-10 h-10 rounded-full bg-[#E89B7E] flex items-center justify-center hover:bg-[#D88B6E] transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <User className="w-5 h-5" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Desktop/Tablet Layout */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button className="hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">today</span>
              <button className="hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-12">
              {/* Calorie Tracker */}
              <div className="flex-shrink-0">
                <CalorieTracker current={2934} goal={3000} />
              </div>

              {/* Macros */}
              <div className="flex-1">
                <MacroDisplay
                  protein={186}
                  carbs={198}
                  fats={78}
                  layout="vertical"
                />
              </div>
            </div>
          </div>

          {/* Food Logs */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-600">
                today's logs
              </h2>
              <button
                className="text-[#E89B7E] text-sm hover:underline"
                onClick={() => setShowAddModal(true)}
              >
                add +
              </button>
            </div>
            <div className="space-y-4">
              {foodLogs.map((log) => (
                <FoodLogItem key={log.id} {...log} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button className="hover:bg-gray-100 p-1 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">today</span>
              <button className="hover:bg-gray-100 p-1 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calorie Tracker */}
            <CalorieTracker current={2934} goal={3000} />

            {/* Macros */}
            <div className="mt-6">
              <MacroDisplay protein={186} carbs={198} fats={78} />
            </div>
          </div>

          {/* Food Logs */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-medium text-gray-600">
                today's logs
              </h2>
              <button className="text-[#E89B7E] text-sm hover:underline">
                add +
              </button>
            </div>
            <div className="space-y-3">
              {foodLogs.map((log) => (
                <FoodLogItem key={log.id} {...log} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E3A5F] px-6 py-4 flex items-center justify-around">
        <button className="text-white hover:text-gray-300 transition-colors">
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate("/camera")}
          className="w-14 h-14 rounded-full bg-[#E89B7E] flex items-center justify-center hover:bg-[#D88B6E] transition-colors -mt-8"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white hover:text-gray-300 transition-colors">
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
    </div>
  );
}
