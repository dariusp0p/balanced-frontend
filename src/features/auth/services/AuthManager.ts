import type {
  LoginCredentials,
  PasswordRecoveryPayload,
  RecoveryQuestionPayload,
  SignupPayload,
} from "../types/auth";
import {
  loginUser,
  lookupRecoveryQuestion,
  recoverPasswordUser,
  signupUser,
} from "./AuthRepository";
import { clearAuthSession } from "./authSession";

function storeAuthSession(data: {
  token: string;
  userId?: number | string;
  user?: {
    id: number | string;
    name: string;
    email: string;
    admin?: boolean;
    roles?: string[];
  };
}) {
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("authToken", data.token);

  const userId = data.userId ?? data.user?.id;
  if (typeof userId !== "undefined") {
    localStorage.setItem("userId", String(userId));
  }

  if (data.user) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    localStorage.setItem("isAdmin", String(Boolean(data.user.admin)));
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
  if (!data.token) {
    throw new Error("No token received from server");
  }
  storeAuthSession(data);
}

export async function fetchRecoveryQuestion(payload: RecoveryQuestionPayload) {
  return lookupRecoveryQuestion(payload);
}

export async function recoverPassword(payload: PasswordRecoveryPayload) {
  const data = await recoverPasswordUser(payload);
  if (!data.token) {
    throw new Error("No token received from server");
  }
  storeAuthSession(data);
}

export function logout() {
  clearAuthSession();
}
