/// <reference types="vite/client" />
import type {
  AuthResponse,
  LoginCredentials,
  PasswordRecoveryPayload,
  RecoveryQuestionPayload,
  RecoveryQuestionResponse,
  SignupPayload,
} from "../types/auth";
import { resolveBackendUrl } from "../../../shared/services/backend";

async function readAuthResponse(res: Response, fallbackMessage: string) {
  const data = (await res.json().catch(() => ({}))) as AuthResponse;

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function loginUser(credentials: LoginCredentials) {
  const res = await fetch(resolveBackendUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return readAuthResponse(res, "Invalid email or password");
}

export async function signupUser(payload: SignupPayload) {
  const res = await fetch(resolveBackendUrl("/auth/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readAuthResponse(res, "Registration failed");
}

export async function lookupRecoveryQuestion(
  payload: RecoveryQuestionPayload,
) {
  const res = await fetch(resolveBackendUrl("/auth/recovery-question"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as RecoveryQuestionResponse & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.message || "Unable to load recovery question");
  }

  return data;
}

export async function recoverPasswordUser(payload: PasswordRecoveryPayload) {
  const res = await fetch(resolveBackendUrl("/auth/recover-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readAuthResponse(res, "Password recovery failed");
}
