import { useNavigate } from "react-router";
import { useState } from "react";

import { CalorieTracker } from "./components/CalorieTracker";
import { MacroDisplay } from "./components/MacroDisplay";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { DateNavigation } from "./components/DateNavigation";
import { FoodLogs } from "./components/FoodLogs";
import { useFoodLogs } from "../../features/food/FoodLogContext";

export function DashboardPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);

  const streakDays = 12; // Mock streak data

  const { foodLogs } = useFoodLogs();

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + log.fats, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        streakDays={streakDays}
        onSettings={() => navigate("/settings")}
        onLogout={() => navigate("/")}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <DateNavigation />
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-shrink-0 w-full md:w-auto">
              <CalorieTracker current={totalCalories} goal={3000} />
            </div>
            <div className="flex-1 w-full">
              <MacroDisplay
                protein={totalProtein}
                carbs={totalCarbs}
                fats={totalFats}
                layout="vertical"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <FoodLogs
            foodLogs={foodLogs}
            onAdd={() => navigate("/log-food?mode=manual")}
          />
        </div>
      </main>

      <BottomNav navigate={navigate} />
    </div>
  );
}
