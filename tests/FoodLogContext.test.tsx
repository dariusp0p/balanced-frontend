// tests/FoodLogContext.test.tsx
import { renderHook, act } from "@testing-library/react";
import {
  FoodLogProvider,
  useFoodLogs,
} from "../src/features/food/FoodLogContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <FoodLogProvider>{children}</FoodLogProvider>;
}

test("provides initial food logs", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  expect(result.current.foodLogs.length).toBeGreaterThan(0);
});

test("adds a food log", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  act(() => {
    result.current.addFoodLog({
      name: "Test",
      time: "10:00",
      date: "2024-03-30",
      calories: 100,
      protein: 10,
      carbs: 20,
      fats: 5,
    });
  });
  expect(result.current.foodLogs.some((f) => f.name === "Test")).toBe(true);
});

test("updates a food log", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  const id = result.current.foodLogs[0].id;
  act(() => {
    result.current.updateFoodLog(id, {
      name: "Updated",
      time: "11:00",
      date: "2024-03-30",
      calories: 200,
      protein: 20,
      carbs: 30,
      fats: 10,
    });
  });
  expect(result.current.foodLogs[0].name).toBe("Updated");
});

test("deletes a food log", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  const id = result.current.foodLogs[0].id;
  act(() => {
    result.current.deleteFoodLog(id);
  });
  expect(result.current.foodLogs.some((f) => f.id === id)).toBe(false);
});

test("throws error if useFoodLogs is used outside provider", () => {
  // Suppress error output for this test
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => renderHook(() => useFoodLogs())).toThrow(
    "useFoodLogs must be used within FoodLogProvider",
  );
  spy.mockRestore();
});

test("adds a food log with incremented id", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  const initialLength = result.current.foodLogs.length;
  act(() => {
    result.current.addFoodLog({
      name: "Test",
      time: "10:00",
      date: "2024-03-30",
      calories: 100,
      protein: 10,
      carbs: 20,
      fats: 5,
    });
  });
  const lastLog = result.current.foodLogs[result.current.foodLogs.length - 1];
  expect(result.current.foodLogs.length).toBe(initialLength + 1);
  expect(lastLog.id).toBeGreaterThan(0);
  expect(lastLog.name).toBe("Test");
});

test("adds a food log when list is empty (id = 1)", () => {
  const { result } = renderHook(() => useFoodLogs(), { wrapper });
  // Remove all logs
  act(() => {
    result.current.foodLogs.forEach((log) =>
      result.current.deleteFoodLog(log.id),
    );
  });
  act(() => {
    result.current.addFoodLog({
      name: "First",
      time: "08:00",
      date: "2024-03-31",
      calories: 50,
      protein: 5,
      carbs: 10,
      fats: 2,
    });
  });
  expect(result.current.foodLogs.length).toBe(1);
  expect(result.current.foodLogs[0].id).toBe(1);
  expect(result.current.foodLogs[0].name).toBe("First");
});
