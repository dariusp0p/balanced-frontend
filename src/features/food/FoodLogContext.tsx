import { createContext, useContext, useState, ReactNode } from "react";

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
  addFoodLog: (log: Omit<FoodLog, "id">) => void;
  updateFoodLog: (id: number, updated: Omit<FoodLog, "id">) => void;
  deleteFoodLog: (id: number) => void;
};

const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined);

export function useFoodLogs() {
  const ctx = useContext(FoodLogContext);
  if (!ctx) throw new Error("useFoodLogs must be used within FoodLogProvider");
  return ctx;
}

export function FoodLogProvider({ children }: { children: ReactNode }) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([
    {
      id: 1,
      name: "Greek Yogurt & Berries",
      time: "08:15",
      date: "2024-03-24",
      calories: 220,
      protein: 18,
      carbs: 28,
      fats: 4,
    },
    {
      id: 2,
      name: "Chicken & Quinoa Salad",
      time: "12:45",
      date: "2024-03-24",
      calories: 540,
      protein: 42,
      carbs: 55,
      fats: 14,
    },
    {
      id: 3,
      name: "Protein Shake",
      time: "16:00",
      date: "2024-03-24",
      calories: 180,
      protein: 30,
      carbs: 8,
      fats: 2,
    },
    {
      id: 4,
      name: "Salmon, Rice & Veggies",
      time: "19:30",
      date: "2024-03-24",
      calories: 610,
      protein: 38,
      carbs: 65,
      fats: 20,
    },
  ]);

  const addFoodLog = (log: Omit<FoodLog, "id">) => {
    setFoodLogs((prev) => [
      ...prev,
      { ...log, id: prev.length ? prev[prev.length - 1].id + 1 : 1 },
    ]);
  };

  const updateFoodLog = (id: number, updated: Omit<FoodLog, "id">) => {
    setFoodLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updated } : log)),
    );
  };

  const deleteFoodLog = (id: number) => {
    setFoodLogs((prev) => prev.filter((log) => log.id !== id));
  };

  return (
    <FoodLogContext.Provider
      value={{ foodLogs, addFoodLog, deleteFoodLog, updateFoodLog }}
    >
      {children}
    </FoodLogContext.Provider>
  );
}
