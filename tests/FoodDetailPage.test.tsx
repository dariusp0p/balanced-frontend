// tests/FoodDetailPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogProvider } from "../src/features/food/FoodLogContext";
import { FoodDetailPage } from "../src/components/food-detail-page";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

test("renders food detail and macros", () => {
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  expect(screen.getByText(/greek yogurt/i)).toBeInTheDocument();
  expect(screen.getAllByText(/protein/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/carbs/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/fats/i).length).toBeGreaterThan(0);
});

test("handles delete", () => {
  window.confirm = vi.fn(() => true);
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
});

test("renders 'Food not found' for missing food", () => {
  render(
    <MemoryRouter initialEntries={["/food/999"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  expect(screen.getByText(/food not found/i)).toBeInTheDocument();
});

test("delete button removes food and navigates", () => {
  window.confirm = vi.fn(() => true);
  const { container } = render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
  // After deletion, should navigate to dashboard
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

test("Back button navigates to dashboard", () => {
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText(/back/i));
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

// Helper to check navigation
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.search}</div>;
}

test("edit button navigates to log-food edit page", () => {
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route
            path="/food/:id"
            element={
              <>
                <FoodDetailPage />
                <LocationDisplay />
              </>
            }
          />
          <Route path="/log-food" element={<LocationDisplay />} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "" })); // The edit button has no accessible name, so this will select the first button without a name
  // If you want to be more specific, use a test id or improve the accessible name
  expect(screen.getByTestId("location-display").textContent).toContain(
    "?edit=1",
  );
});

test("delete button removes food and navigates", () => {
  window.confirm = vi.fn(() => true);
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

test("delete button does nothing if user cancels", () => {
  window.confirm = vi.fn(() => false);
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTitle(/delete/i));
  // Should still be on the detail page, not dashboard
  expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  // Optionally, check that the food name is still present
  expect(screen.getByText(/greek yogurt/i)).toBeInTheDocument();
});
