import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  fetchFoodLogs,
  fetchLogGroupsApi,
  createLogGroupApi,
  updateLogGroupApi,
  deleteLogGroupApi,
  addFoodLogApi,
  updateFoodLogApi,
  deleteFoodLogApi,
  isFoodLogAuthRequired,
  getPendingFoodLogSyncCount,
  isFoodLogBackendReachable,
  onFoodLogApiStateChange,
  syncFoodLogQueue,
} from "./foodApi";

export type FoodLog = {
  id: number;
  name: string;
  time: string;
  date: string;
  logGroupId?: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type FoodLogGroup = {
  id: number;
  date: string;
  name: string;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
  computeFromFoodLogs?: boolean;
};

type FoodLogContextType = {
  foodLogs: FoodLog[];
  foodLogGroups: FoodLogGroup[];
  isOffline: boolean;
  needsReauth: boolean;
  pendingSyncCount: number;
  addFoodLog: (log: Omit<FoodLog, "id">) => Promise<void>;
  updateFoodLog: (id: number, updated: Omit<FoodLog, "id">) => Promise<void>;
  deleteFoodLog: (id: number) => Promise<void>;
  createFoodLogGroup: (date: string, name: string) => Promise<number>;
  updateFoodLogGroup: (groupId: number, name: string) => Promise<void>;
  deleteFoodLogGroup: (groupId: number) => Promise<void>;
  assignFoodLogToGroup: (
    date: string,
    foodLogId: number,
    groupId: number | null,
  ) => Promise<void>;
  getFoodLogGroupForLog: (date: string, foodLogId: number) => number | null;
  refreshFoodLogs: () => Promise<void>;
  syncPendingChanges: () => Promise<void>;
};

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined);

export function useFoodLogs() {
  const ctx = useContext(FoodLogContext);
  if (!ctx) throw new Error("useFoodLogs must be used within FoodLogProvider");
  return ctx;
}

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodLogGroups, setFoodLogGroups] = useState<FoodLogGroup[]>([]);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [needsReauth, setNeedsReauth] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const refreshPendingCount = () => {
    setPendingSyncCount(getPendingFoodLogSyncCount());
  };

  const refreshStatusFlags = () => {
    setNeedsReauth(isFoodLogAuthRequired());
    setIsOffline(
      typeof navigator !== "undefined"
        ? !navigator.onLine || !isFoodLogBackendReachable()
        : !isFoodLogBackendReachable(),
    );
  };

  const syncPendingChanges = async () => {
    await syncFoodLogQueue();
    refreshPendingCount();
  };

  const refreshFoodLogs = async () => {
    try {
      await syncPendingChanges();
      const [logs, groups] = await Promise.all([
        fetchFoodLogs(),
        fetchLogGroupsApi(),
      ]);
      setFoodLogs(logs);
      setFoodLogGroups(groups);
      refreshStatusFlags();
    } catch {
      setFoodLogs((prev) => prev);
      setFoodLogGroups((prev) => prev);
      refreshStatusFlags();
    } finally {
      refreshPendingCount();
    }
  };

  useEffect(() => {
    refreshFoodLogs();
  }, []);

  useEffect(() => {
    const unsubscribe = onFoodLogApiStateChange(() => {
      refreshStatusFlags();
      refreshPendingCount();
    });

    const intervalId = window.setInterval(() => {
      refreshStatusFlags();
      refreshPendingCount();
    }, 1000);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isOffline && pendingSyncCount === 0) return;

    const intervalId = window.setInterval(() => {
      void refreshFoodLogs();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOffline, pendingSyncCount]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      await syncPendingChanges();
      await refreshFoodLogs();
    };

    const handleOffline = () => {
      setIsOffline(true);
      refreshPendingCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addFoodLog = async (log: Omit<FoodLog, "id">) => {
    await addFoodLogApi(log);
    refreshPendingCount();
    await refreshFoodLogs();
  };

  const updateFoodLog = async (id: number, updated: Omit<FoodLog, "id">) => {
    await updateFoodLogApi(id, updated);
    refreshPendingCount();
    await refreshFoodLogs();
  };

  const deleteFoodLog = async (id: number) => {
    await deleteFoodLogApi(id);
    refreshPendingCount();
    await refreshFoodLogs();
  };

  const createFoodLogGroup = async (date: string, name: string) => {
    const trimmedName = name.trim();
    const created = await createLogGroupApi({
      name: trimmedName,
      date,
      computeFromFoodLogs: true,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    });
    await refreshFoodLogs();
    return created.id;
  };

  const updateFoodLogGroup = async (groupId: number, name: string) => {
    const trimmedName = name.trim();
    const existingGroup = foodLogGroups.find((group) => group.id === groupId);
    if (!existingGroup) return;

    await updateLogGroupApi(groupId, {
      name: trimmedName,
      date: existingGroup.date,
      computeFromFoodLogs: true,
      totalCalories: existingGroup.totalCalories ?? 0,
      totalProtein: existingGroup.totalProtein ?? 0,
      totalCarbs: existingGroup.totalCarbs ?? 0,
      totalFats: existingGroup.totalFats ?? 0,
    });
    await refreshFoodLogs();
  };

  const deleteFoodLogGroup = async (groupId: number) => {
    await deleteLogGroupApi(groupId);
    await refreshFoodLogs();
  };

  const assignFoodLogToGroup = async (
    date: string,
    foodLogId: number,
    groupId: number | null,
  ) => {
    const targetLog = foodLogs.find(
      (log) => log.id === foodLogId && log.date === date,
    );
    if (!targetLog) return;

    await updateFoodLogApi(foodLogId, {
      name: targetLog.name,
      date: targetLog.date,
      time: targetLog.time,
      logGroupId: groupId,
      calories: targetLog.calories,
      protein: targetLog.protein,
      carbs: targetLog.carbs,
      fats: targetLog.fats,
    });
    refreshPendingCount();
    await refreshFoodLogs();
  };

  const getFoodLogGroupForLog = (date: string, foodLogId: number) => {
    const targetLog = foodLogs.find(
      (log) => log.id === foodLogId && log.date === date,
    );
    return targetLog?.logGroupId ?? null;
  };

  return (
    <FoodLogContext.Provider
      value={{
        foodLogs,
        foodLogGroups,
        isOffline,
        needsReauth,
        pendingSyncCount,
        addFoodLog,
        deleteFoodLog,
        updateFoodLog,
        createFoodLogGroup,
        updateFoodLogGroup,
        deleteFoodLogGroup,
        assignFoodLogToGroup,
        getFoodLogGroupForLog,
        refreshFoodLogs,
        syncPendingChanges,
      }}
    >
      {children}
    </FoodLogContext.Provider>
  );
}
