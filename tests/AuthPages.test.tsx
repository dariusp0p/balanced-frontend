import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { vi } from "vitest";
import { LoginPage } from "../src/features/auth/views/login-page";
import { SignupPage } from "../src/features/auth/views/signup-page";
import { ForgotPasswordPage } from "../src/features/auth/views/forgot-password-page";

const authManagerMock = vi.hoisted(() => ({
  signup: vi.fn(async () => {}),
  login: vi.fn(async () => {}),
  fetchRecoveryQuestion: vi.fn(async () => ({
    recoveryQuestion: "What is your favorite food?",
  })),
  recoverPassword: vi.fn(async () => {}),
}));

vi.mock("../src/features/auth/services/AuthManager", () => authManagerMock);

function renderWithRoutes(initialEntry: string, element: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  authManagerMock.signup.mockClear();
  authManagerMock.login.mockClear();
  authManagerMock.fetchRecoveryQuestion.mockClear();
  authManagerMock.recoverPassword.mockClear();
});

test("signup submits recovery question and answer", async () => {
  renderWithRoutes("/signup", <SignupPage />);

  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: "Recovery User" },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "recovery@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByLabelText(/recovery question/i), {
    target: { value: "What is your favorite food?" },
  });
  fireEvent.change(screen.getByLabelText(/recovery answer/i), {
    target: { value: "Pizza" },
  });
  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: "password123" },
  });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  await waitFor(() =>
    expect(authManagerMock.signup).toHaveBeenCalledWith({
      name: "Recovery User",
      email: "recovery@example.com",
      password: "password123",
      confirmPassword: "password123",
      recoveryQuestion: "What is your favorite food?",
      recoveryAnswer: "Pizza",
    }),
  );
});

test("login routes to forgot password", () => {
  renderWithRoutes("/", <LoginPage />);

  fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));

  expect(screen.getByRole("heading", { name: /recover password/i })).toBeInTheDocument();
});

test("forgot password loads the recovery question and submits a reset", async () => {
  renderWithRoutes("/forgot-password", <ForgotPasswordPage />);

  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "recovery@example.com" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /load recovery question/i }),
  );

  await waitFor(() =>
    expect(authManagerMock.fetchRecoveryQuestion).toHaveBeenCalledWith({
      email: "recovery@example.com",
    }),
  );

  fireEvent.change(screen.getByLabelText(/recovery answer/i), {
    target: { value: "Pizza" },
  });
  fireEvent.change(screen.getByLabelText(/^new password$/i), {
    target: { value: "newpassword123" },
  });
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
    target: { value: "newpassword123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

  await waitFor(() =>
    expect(authManagerMock.recoverPassword).toHaveBeenCalledWith({
      email: "recovery@example.com",
      recoveryAnswer: "Pizza",
      newPassword: "newpassword123",
      confirmPassword: "newpassword123",
    }),
  );
});
