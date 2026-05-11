// tests/AddFoodLogPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogProvider } from "../src/features/food/store/FoodLogContext";
import { LogFoodPage } from "../src/features/food/views/AddFoodLogPage";
import { MemoryRouter } from "react-router";
import { useLocation, Route, Routes } from "react-router";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.search}</div>;
}

function setup(route = "/log-food") {
  window.history.pushState({}, "Test page", route);
  render(
    <MemoryRouter initialEntries={[route]}>
      <FoodLogProvider>
        <LogFoodPage />
      </FoodLogProvider>
    </MemoryRouter>,
  );
}

test("renders form", () => {
  setup();
  expect(screen.getByPlaceholderText(/food name/i)).toBeInTheDocument();
});

test("shows validation error on empty submit", async () => {
  setup();
  // Find the form element
  const form = document.querySelector("form");
  if (form) {
    fireEvent.submit(form);
  } else {
    throw new Error("Form element not found");
  }
  expect(
    await screen.findByText((content) =>
      content.toLowerCase().includes("name is required"),
    ),
  ).toBeInTheDocument();
});

test("adds a food log", async () => {
  setup();
  fireEvent.change(screen.getByPlaceholderText(/food name/i), {
    target: { value: "Toast" },
  });
  fireEvent.change(screen.getByPlaceholderText(/calories/i), {
    target: { value: "123" },
  });
  fireEvent.change(screen.getByPlaceholderText(/protein/i), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByPlaceholderText(/carbs/i), {
    target: { value: "20" },
  });
  fireEvent.change(screen.getByPlaceholderText(/fats/i), {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  // Wait for navigation or state update
  await new Promise((r) => setTimeout(r, 100));
  expect(
    screen.queryByText((content) =>
      content.toLowerCase().includes("name is required"),
    ),
  ).not.toBeInTheDocument();
});
test("edits a food log", () => {
  // Add a log, then edit it
  setup();
  // ...simulate add, then navigate to edit route and check pre-filled values
});

test("pre-fills form in edit mode and updates log", async () => {
  setup("/log-food?edit=1");
  // Should pre-fill with Greek Yogurt & Berries
  expect(await screen.findByDisplayValue(/greek yogurt/i)).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText(/food name/i), {
    target: { value: "Updated Yogurt" },
  });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  // Wait for navigation or state update
  await new Promise((r) => setTimeout(r, 100));
  // No error should be present
  expect(
    screen.queryByText((content) =>
      content.toLowerCase().includes("name is required"),
    ),
  ).not.toBeInTheDocument();
});

test("AI Analysis button navigates to /log-food?mode=ai", () => {
  render(
    <MemoryRouter initialEntries={["/log-food"]}>
      <FoodLogProvider>
        <LogFoodPage />
        <LocationDisplay />
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText(/ai analysis/i));
  expect(screen.getByTestId("location-display").textContent).toBe("?mode=ai");
});

test("Close button navigates to dashboard", () => {
  render(
    <MemoryRouter initialEntries={["/log-food"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/log-food" element={<LogFoodPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText(/close/i));
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
