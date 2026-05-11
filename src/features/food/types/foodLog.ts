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

export type FoodLogPayload = Omit<FoodLog, "id">;

export type FoodLogEntity = FoodLog;

export type FoodLogGroup = {
  id: number;
  date: string;
  name: string;
  mealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "CUSTOM";
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
  computeFromFoodLogs?: boolean;
};

export type LogGroupPayload = {
  name: string;
  mealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "CUSTOM";
  date: string;
  computeFromFoodLogs: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
};

export type LogGroupEntity = LogGroupPayload & {
  id: number;
};

export type FoodLogPageEntity = {
  content: FoodLogEntity[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type DailyFoodLogEntity = {
  date: string;
  foodLogs: FoodLogEntity[];
  logGroups: LogGroupEntity[];
};
