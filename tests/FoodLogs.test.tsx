// tests/FoodLogs.test.tsx
import { MemoryRouter } from "react-router";
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogs } from "../src/features/dashboard/views/components/FoodLogs";
import { FoodLogProvider } from "../src/features/food/store/FoodLogContext";

const logs = [
  {
    id: 1,
    name: "Eggs",
    time: "09:00",
    date: "2026-04-20",
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
        <FoodLogs
          foodLogs={logs}
          groups={[]}
          selectedDate="2026-04-20"
          onCreateGroup={vi.fn()}
          onRenameGroup={vi.fn()}
          onDeleteGroup={vi.fn()}
          onAssignLogToGroup={vi.fn()}
          getGroupForLog={() => null}
          onAdd={vi.fn()}
        />
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
        <FoodLogs
          foodLogs={logs}
          groups={[]}
          selectedDate="2026-04-20"
          onCreateGroup={vi.fn()}
          onRenameGroup={vi.fn()}
          onDeleteGroup={vi.fn()}
          onAssignLogToGroup={vi.fn()}
          getGroupForLog={() => null}
          onAdd={onAdd}
        />
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText(/add/i));
  expect(onAdd).toHaveBeenCalled();
});

test("opens create group modal and creates group", () => {
  const onCreateGroup = vi.fn();

  render(
    <MemoryRouter>
      <FoodLogProvider>
        <FoodLogs
          foodLogs={logs}
          groups={[]}
          selectedDate="2026-04-20"
          onCreateGroup={onCreateGroup}
          onRenameGroup={vi.fn()}
          onDeleteGroup={vi.fn()}
          onAssignLogToGroup={vi.fn()}
          getGroupForLog={() => null}
          onAdd={vi.fn()}
        />
      </FoodLogProvider>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByText(/group \+/i));
  fireEvent.change(screen.getByPlaceholderText(/group name/i), {
    target: { value: "Lunch" },
  });
  fireEvent.click(screen.getByRole("button", { name: /create/i }));

  expect(onCreateGroup).toHaveBeenCalledWith("Lunch");
});

test("calls onAdd from inside log group", () => {
  const onAdd = vi.fn();
  const groups = [{ id: "group-1", date: "2026-04-20", name: "Lunch" }];

  render(
    <MemoryRouter>
      <FoodLogProvider>
        <FoodLogs
          foodLogs={logs}
          groups={groups}
          selectedDate="2026-04-20"
          onCreateGroup={vi.fn()}
          onRenameGroup={vi.fn()}
          onDeleteGroup={vi.fn()}
          onAssignLogToGroup={vi.fn()}
          getGroupForLog={() => "group-1"}
          onAdd={onAdd}
        />
      </FoodLogProvider>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByTitle(/add food log/i));
  expect(onAdd).toHaveBeenCalled();
});
