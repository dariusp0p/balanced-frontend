// tests/FoodDetailPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FoodLogProvider } from "../src/features/food/store/FoodLogContext";
import { FoodDetailPage } from "../src/features/food/views/FoodDetailPage";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

test("renders food detail and macros", async () => {
  render(
    <MemoryRouter initialEntries={["/food/1"]}>
      <FoodLogProvider>
        <Routes>
          <Route path="/food/:id" element={<FoodDetailPage />} />
        </Routes>
      </FoodLogProvider>
    </MemoryRouter>,
  );
  expect(await screen.findByText(/greek yogurt/i)).toBeInTheDocument();
  expect(screen.getAllByText(/protein/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/carbs/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/fats/i).length).toBeGreaterThan(0);
});

test("handles delete", async () => {
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
  await screen.findByText(/greek yogurt/i);
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

test("delete button removes food and navigates", async () => {
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
  await screen.findByText(/greek yogurt/i);
  fireEvent.click(screen.getByTitle(/delete/i));
  // After deletion, should navigate to dashboard
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

test("Back button navigates to dashboard", async () => {
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
  await screen.findByText(/greek yogurt/i);
  fireEvent.click(screen.getByText(/back/i));
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

// Helper to check navigation
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.search}</div>;
}

test("edit button navigates to log-food edit page", async () => {
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
  await screen.findByText(/greek yogurt/i);
  fireEvent.click(screen.getByTitle(/edit/i));
  expect(screen.getByTestId("location-display").textContent).toContain(
    "?edit=1",
  );
});

test("delete button removes food and navigates", async () => {
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
  await screen.findByText(/greek yogurt/i);
  fireEvent.click(screen.getByTitle(/delete/i));
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

test("delete button does nothing if user cancels", async () => {
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
  await screen.findByText(/greek yogurt/i);
  fireEvent.click(screen.getByTitle(/delete/i));
  // Should still be on the detail page, not dashboard
  expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  // Optionally, check that the food name is still present
  expect(screen.getByText(/greek yogurt/i)).toBeInTheDocument();
});
