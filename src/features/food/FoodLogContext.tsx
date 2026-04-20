import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  fetchFoodLogs,
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
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type FoodLogContextType = {
  foodLogs: FoodLog[];
  isOffline: boolean;
  needsReauth: boolean;
  pendingSyncCount: number;
  addFoodLog: (log: Omit<FoodLog, "id">) => Promise<void>;
  updateFoodLog: (id: number, updated: Omit<FoodLog, "id">) => Promise<void>;
  deleteFoodLog: (id: number) => Promise<void>;
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
      const logs = await fetchFoodLogs();
      setFoodLogs(logs);
      refreshStatusFlags();
    } catch {
      setFoodLogs((prev) => prev);
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

  return (
    <FoodLogContext.Provider
      value={{
        foodLogs,
        isOffline,
        needsReauth,
        pendingSyncCount,
        addFoodLog,
        deleteFoodLog,
        updateFoodLog,
        refreshFoodLogs,
        syncPendingChanges,
      }}
    >
      {children}
    </FoodLogContext.Provider>
  );
}
