// tests/FoodLogs.test.tsx
import { MemoryRouter } from "react-router";
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogs } from "../src/features/dashboard/components/FoodLogs";
import { FoodLogProvider } from "../src/features/food/FoodLogContext";

const logs = [
  {
    id: 1,
    name: "Eggs",
    time: "09:00",
    calories: 100,
    protein: 10,
    carbs: 5,
    fats: 7,
  },
];

test("renders food logs", () => {
  render(
    <MemoryRouter>
      <FoodLogProvider>
        <FoodLogs foodLogs={logs} onAdd={vi.fn()} />
      </FoodLogProvider>{" "}
    </MemoryRouter>,
  );
  expect(screen.getByText(/eggs/i)).toBeInTheDocument();
});

test("calls onAdd when add button clicked", () => {
  const onAdd = vi.fn();
  render(
    <MemoryRouter>
      <FoodLogProvider>
        <FoodLogs foodLogs={logs} onAdd={onAdd} />
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText(/add/i));
  expect(onAdd).toHaveBeenCalled();
});
