import type {
  AuthResponse,
  LoginCredentials,
  SignupPayload,
} from "../types/auth";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

async function readAuthResponse(res: Response, fallbackMessage: string) {
  const data = (await res.json().catch(() => ({}))) as AuthResponse;

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function loginUser(credentials: LoginCredentials) {
  const res = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return readAuthResponse(res, "Invalid email or password");
}

export async function signupUser(payload: SignupPayload) {
  const res = await fetch(`${BACKEND_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readAuthResponse(res, "Registration failed");
}
