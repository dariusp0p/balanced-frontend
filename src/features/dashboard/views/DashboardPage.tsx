import { useLocation, useNavigate } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useFoodLogs } from "../../food/store/FoodLogContext";
import type { FoodLog } from "../../food/types/foodLog";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { DateNavigation } from "./components/DateNavigation";
import { CalorieTracker } from "./components/CalorieTracker";
import { MacroDisplay } from "./components/MacroDisplay";
import { FoodLogs } from "./components/FoodLogs";

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isOffline,
    needsReauth,
    pendingSyncCount,
    foodLogGroups,
    deleteFoodLog,
    createFoodLogGroup,
    updateFoodLogGroup,
    deleteFoodLogGroup,
    assignFoodLogToGroup,
    getFoodLogGroupForLog,
    loadDailyFoodLog,
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
  const loadDailyFoodLogRef = useRef(loadDailyFoodLog);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    loadDailyFoodLogRef.current = loadDailyFoodLog;
  }, [loadDailyFoodLog]);

  const fetchFoodLogsForDate = useCallback(async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return loadDailyFoodLogRef.current(dateStr);
  }, []);

  const refreshSelectedDateLogs = useCallback(
    async (date?: Date) => {
      try {
        const dailyLog = await fetchFoodLogsForDate(
          date ?? selectedDateRef.current,
        );
        setFoodLogs(dailyLog.foodLogs);
      } catch {
        // Connectivity/auth fallback is handled in FoodLogManager + context status flags.
      }
    },
    [fetchFoodLogsForDate],
  );

  // Fetch food logs for selected date
  useEffect(() => {
    setLoading(true);
    refreshSelectedDateLogs(selectedDate).finally(() => setLoading(false));
  }, [refreshSelectedDateLogs, selectedDate]);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFats = foodLogs.reduce((sum, log) => sum + log.fats, 0);
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDateGroups = foodLogGroups.filter(
    (group) => group.date === selectedDateStr,
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav streakDays={streakDays} connectionStatus={connectionStatus} />

      <main className="mx-auto w-full max-w-[480px] px-4 pb-28 pt-6">
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
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <DateNavigation
            initialDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <div className="flex flex-col items-center justify-center gap-10">
            <div className="flex flex-shrink-0 items-center justify-center p-4">
              <CalorieTracker current={totalCalories} goal={3000} />
            </div>
            <div className="flex flex-col items-center justify-center gap-6">
              <MacroDisplay
                protein={totalProtein}
                carbs={totalCarbs}
                fats={totalFats}
                layout="horizontal"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => navigate("/infinite-food-logs")}
            >
              Open Infinite Scroll Demo
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <FoodLogs
              foodLogs={foodLogs}
              groups={selectedDateGroups}
              selectedDate={selectedDateStr}
              onDeleteFoodLog={(id) => {
                void deleteFoodLog(id)
                  .then(() => refreshSelectedDateLogs())
                  .catch(() => null);
              }}
              onCreateGroup={(name) =>
                createFoodLogGroup(selectedDateStr, name).then((groupId) => {
                  void refreshSelectedDateLogs();
                  return groupId;
                })
              }
              onRenameGroup={(groupId, name) =>
                updateFoodLogGroup(groupId, name).then(() =>
                  refreshSelectedDateLogs(),
                )
              }
              onDeleteGroup={(groupId) =>
                deleteFoodLogGroup(groupId).then(() =>
                  refreshSelectedDateLogs(),
                )
              }
              onAssignLogToGroup={(foodLogId, groupId) =>
                assignFoodLogToGroup(selectedDateStr, foodLogId, groupId).then(
                  () => refreshSelectedDateLogs(),
                )
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

      {/* <GeneratorControls defaultDate={format(selectedDate, "yyyy-MM-dd")} /> */}
      <BottomNav navigate={navigate} currentPath={location.pathname} />
    </div>
  );
}
