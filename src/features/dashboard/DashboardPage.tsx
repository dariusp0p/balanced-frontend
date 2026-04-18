import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { CalorieTracker } from "./components/CalorieTracker";
import { MacroProportionChart } from "./components/MacroProportionChart"; // import your new component
import { MacroDisplay } from "./components/MacroDisplay";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { DateNavigation } from "./components/DateNavigation";
import { FoodLogs } from "./components/FoodLogs";
import { useFoodLogs } from "../../features/food/FoodLogContext";

export function DashboardPage() {
  const navigate = useNavigate();

  const streakDays = 12; // Mock streak data

  const { foodLogs } = useFoodLogs();

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + log.fats, 0);

  function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(false);
    useEffect(() => {
      const check = () =>
        setIsMdUp(window.matchMedia("(min-width: 768px)").matches);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);
    return isMdUp;
  }

  const isMdUp = useIsMdUp();

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
          <div className="flex flex-col md:flex-row items-center justify-center gap-24 md:gap-12">
            <div className="flex-shrink-0 flex justify-center items-center p-6 md:p-8 scale-110">
              <CalorieTracker current={totalCalories} goal={3000} />
            </div>
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Chart: only on md+ */}
              <div className="hidden md:block">
                <MacroProportionChart
                  protein={totalProtein}
                  carbs={totalCarbs}
                  fats={totalFats}
                  size={200}
                />
              </div>
              {/* MacroDisplay: always visible, but only here on md+ */}
              <div className="hidden md:block">
                <MacroDisplay
                  protein={totalProtein}
                  carbs={totalCarbs}
                  fats={totalFats}
                  layout="horizontal"
                />
              </div>
              {/* MacroDisplay: only on mobile */}
              <div className="block md:hidden">
                <MacroDisplay
                  protein={totalProtein}
                  carbs={totalCarbs}
                  fats={totalFats}
                  layout="horizontal"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
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
