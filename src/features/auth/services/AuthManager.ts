import type { LoginCredentials, SignupPayload } from "../types/auth";
import { loginUser, signupUser } from "./AuthRepository";

function storeAuthSession(data: { token?: string; userId?: number | string }) {
  localStorage.setItem("isAuthenticated", "true");

  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }

  if (typeof data.userId !== "undefined") {
    localStorage.setItem("userId", String(data.userId));
  }
}

export async function login(credentials: LoginCredentials) {
  const data = await loginUser(credentials);

  if (!data.token) {
    throw new Error("No token received from server");
  }

  storeAuthSession(data);
}

export async function signup(payload: SignupPayload) {
  const data = await signupUser(payload);
  storeAuthSession(data);
}
