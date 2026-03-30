// tests/FoodLogItem.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogItem } from "../src/features/dashboard/components/FoodLogItem";
import { MemoryRouter } from "react-router";

test("delete button calls onDelete after confirm", () => {
  window.confirm = vi.fn(() => true);
  const onDelete = vi.fn();
  render(
    <MemoryRouter>
      <FoodLogItem
        id={1}
        name="Eggs"
        time="09:00"
        calories={100}
        protein={10}
        carbs={5}
        fats={7}
        onDelete={onDelete}
      />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
  expect(onDelete).toHaveBeenCalledWith(1);
});

test("delete button does nothing if user cancels", () => {
  window.confirm = vi.fn(() => false);
  const onDelete = vi.fn();
  render(
    <MemoryRouter>
      <FoodLogItem
        id={1}
        name="Eggs"
        time="09:00"
        calories={100}
        protein={10}
        carbs={5}
        fats={7}
        onDelete={onDelete}
      />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
  expect(onDelete).not.toHaveBeenCalled();
});
