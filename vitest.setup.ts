import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

const foodLogManagerMock = vi.hoisted(() => {
  const initialFoodLogs = [
    {
      id: 1,
      name: "Greek Yogurt & Berries",
      time: "08:30",
      date: "2024-03-30",
      calories: 260,
      protein: 22,
      carbs: 32,
      fats: 6,
    },
    {
      id: 2,
      name: "Chicken Rice Bowl",
      time: "12:45",
      date: "2024-03-30",
      calories: 640,
      protein: 42,
      carbs: 68,
      fats: 18,
    },
  ];

  let foodLogs = initialFoodLogs.map((log) => ({ ...log }));
  let foodLogGroups: any[] = [];
  let groupId = 1;

  const reset = () => {
    foodLogs = initialFoodLogs.map((log) => ({ ...log }));
    foodLogGroups = [];
    groupId = 1;
  };

  const module = {
    fetchFoodLogs: vi.fn(async () => foodLogs.map((log) => ({ ...log }))),
    fetchFoodLogsByDate: vi.fn(async (date: string) =>
      foodLogs.filter((log) => log.date === date).map((log) => ({ ...log })),
    ),
    fetchFoodLogsPageApi: vi.fn(async (page: number, size: number) => ({
      content: foodLogs
        .slice(page * size, page * size + size)
        .map((log) => ({ ...log })),
      page,
      size,
      totalElements: foodLogs.length,
      totalPages: Math.ceil(foodLogs.length / size),
    })),
    fetchLogGroupsApi: vi.fn(async () =>
      foodLogGroups.map((group) => ({ ...group })),
    ),
    addFoodLogApi: vi.fn(async (payload: any) => {
      const id =
        foodLogs.length > 0
          ? Math.max(...foodLogs.map((log) => log.id)) + 1
          : 1;
      const created = { id, ...payload };
      foodLogs = [...foodLogs, created];
      return { ...created };
    }),
    updateFoodLogApi: vi.fn(async (id: number, payload: any) => {
      const updated = { id, ...payload };
      foodLogs = foodLogs.map((log) => (log.id === id ? updated : log));
      return { ...updated };
    }),
    deleteFoodLogApi: vi.fn(async (id: number) => {
      foodLogs = foodLogs.filter((log) => log.id !== id);
      return true;
    }),
    createLogGroupApi: vi.fn(async (payload: any) => {
      const created = { id: groupId, ...payload };
      groupId += 1;
      foodLogGroups = [...foodLogGroups, created];
      return { ...created };
    }),
    updateLogGroupApi: vi.fn(async (id: number, payload: any) => {
      const updated = { id, ...payload };
      foodLogGroups = foodLogGroups.map((group) =>
        group.id === id ? updated : group,
      );
      return { ...updated };
    }),
    deleteLogGroupApi: vi.fn(async (id: number) => {
      foodLogGroups = foodLogGroups.filter((group) => group.id !== id);
      foodLogs = foodLogs.filter((log) => log.logGroupId !== id);
      return true;
    }),
    isFoodLogAuthRequired: vi.fn(() => false),
    getPendingFoodLogSyncCount: vi.fn(() => 0),
    isFoodLogBackendReachable: vi.fn(() => true),
    onFoodLogApiStateChange: vi.fn(() => () => {}),
    syncFoodLogQueue: vi.fn(async () => {}),
    startFoodLogGenerator: vi.fn(async () => ({ running: true })),
    stopFoodLogGenerator: vi.fn(async () => ({ running: false })),
  };

  return { module, reset };
});

vi.mock("./src/features/food/services/FoodLogManager", () => {
  return foodLogManagerMock.module;
});

beforeEach(() => {
  foodLogManagerMock.reset();
});
