import { useNavigate } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import {
  fetchFoodLogsByDate,
  syncFoodLogQueue,
} from "../../features/food/foodApi";
import {
  connectFoodLogsWs,
  disconnectFoodLogsWs,
} from "../../features/food/foodWs";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { DateNavigation } from "./components/DateNavigation";
import { CalorieTracker } from "./components/CalorieTracker";
import { MacroProportionChart } from "./components/MacroProportionChart";
import { MacroDisplay } from "./components/MacroDisplay";
import { FoodLogs } from "./components/FoodLogs";
import { GeneratorControls } from "./components/GeneratorControls";
import { useFoodLogs } from "../../features/food/FoodLogContext";
import type { FoodLog } from "../../features/food/FoodLogContext";

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    isOffline,
    needsReauth,
    pendingSyncCount,
    foodLogGroups,
    createFoodLogGroup,
    updateFoodLogGroup,
    deleteFoodLogGroup,
    assignFoodLogToGroup,
    getFoodLogGroupForLog,
  } = useFoodLogs();
  const streakDays = 12; // Mock streak data
  const connectionStatus: "offline" | "syncing" | "synced" = isOffline
    ? "offline"
    : pendingSyncCount > 0
      ? "syncing"
      : "synced";

  // Date state for navigation
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateRef = useRef<Date>(new Date());
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const fetchFoodLogsForDate = useCallback(async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return fetchFoodLogsByDate(dateStr);
  }, []);

  const refreshSelectedDateLogs = useCallback(
    async (date?: Date) => {
      try {
        const logs = await fetchFoodLogsForDate(
          date ?? selectedDateRef.current,
        );
        setFoodLogs(logs);
      } catch {
        // Connectivity/auth fallback is handled in foodApi + context status flags.
      }
    },
    [fetchFoodLogsForDate],
  );

  // Fetch food logs for selected date
  useEffect(() => {
    setLoading(true);
    refreshSelectedDateLogs(selectedDate).finally(() => setLoading(false));
  }, [refreshSelectedDateLogs, selectedDate]);

  useEffect(() => {
    const started = connectFoodLogsWs({
      onConnectionChange: setRealtimeConnected,
      onUpdate: async () => {
        await syncFoodLogQueue();
        await refreshSelectedDateLogs();
      },
    });

    if (!started) {
      setRealtimeConnected(false);
    }

    return () => {
      disconnectFoodLogsWs();
    };
  }, [refreshSelectedDateLogs]);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        void refreshSelectedDateLogs();
      },
      realtimeConnected ? 5000 : 3000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [realtimeConnected, refreshSelectedDateLogs]);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + log.fats, 0);
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateGroups = foodLogGroups.filter(
    (group) => group.date === selectedDateStr,
  );

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
        connectionStatus={connectionStatus}
        onSettings={() => navigate("/settings")}
        onLogout={() => navigate("/")}
      />

      <main className="max-w-7xl mx-auto p-6">
        {needsReauth && (
          <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-800">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>
                Session expired on server restart. Local changes are kept and
                queued. Please sign in again to resume sync.
              </span>
              <button
                type="button"
                className="self-start rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                onClick={() => navigate("/")}
              >
                Re-authenticate
              </button>
            </div>
          </div>
        )}
        {(isOffline || pendingSyncCount > 0) && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {isOffline
              ? "You are offline. Changes are saved locally and will sync automatically when connection returns."
              : "Back online. Synchronizing local changes..."}
            {pendingSyncCount > 0 && ` Pending operations: ${pendingSyncCount}`}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
          <DateNavigation
            initialDate={selectedDate}
            onDateChange={setSelectedDate}
          />
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
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <FoodLogs
              foodLogs={foodLogs}
              groups={selectedDateGroups}
              selectedDate={selectedDateStr}
              onCreateGroup={(name) =>
                createFoodLogGroup(selectedDateStr, name)
              }
              onRenameGroup={updateFoodLogGroup}
              onDeleteGroup={deleteFoodLogGroup}
              onAssignLogToGroup={(foodLogId, groupId) =>
                assignFoodLogToGroup(selectedDateStr, foodLogId, groupId)
              }
              getGroupForLog={(foodLogId) =>
                getFoodLogGroupForLog(selectedDateStr, foodLogId)
              }
              onAdd={(groupId) =>
                navigate(
                  groupId
                    ? `/log-food?mode=manual&groupId=${groupId}`
                    : "/log-food?mode=manual",
                )
              }
            />
          )}
        </div>
      </main>

      <GeneratorControls defaultDate={format(selectedDate, "yyyy-MM-dd")} />
      <BottomNav navigate={navigate} />
    </div>
  );
}
