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
  addFoodLog: (log: Omit<FoodLog, "id">) => Promise<void>;
  updateFoodLog: (id: number, updated: Omit<FoodLog, "id">) => Promise<void>;
  deleteFoodLog: (id: number) => Promise<void>;
  refreshFoodLogs: () => Promise<void>;
};

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined);

export function useFoodLogs() {
  const ctx = useContext(FoodLogContext);
  if (!ctx) throw new Error("useFoodLogs must be used within FoodLogProvider");
  return ctx;
}

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  const refreshFoodLogs = async () => {
    try {
      const logs = await fetchFoodLogs();
      setFoodLogs(logs);
    } catch (e) {
      setFoodLogs([]);
    }
  };

  useEffect(() => {
    refreshFoodLogs();
  }, []);

  const addFoodLog = async (log: Omit<FoodLog, "id">) => {
    await addFoodLogApi(log);
    await refreshFoodLogs();
  };

  const updateFoodLog = async (id: number, updated: Omit<FoodLog, "id">) => {
    await updateFoodLogApi(id, updated);
    await refreshFoodLogs();
  };

  const deleteFoodLog = async (id: number) => {
    await deleteFoodLogApi(id);
    await refreshFoodLogs();
  };

  return (
    <FoodLogContext.Provider
      value={{
        foodLogs,
        addFoodLog,
        deleteFoodLog,
        updateFoodLog,
        refreshFoodLogs,
      }}
    >
      {children}
    </FoodLogContext.Provider>
  );
}
