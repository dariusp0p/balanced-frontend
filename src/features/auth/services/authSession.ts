type StoredUser = {
  id: number | string;
  name: string;
  email: string;
  admin?: boolean;
  roles?: string[];
};

export function isAuthenticated() {
  return Boolean(localStorage.getItem("authToken"));
}

export function readCurrentUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function isAdminUser() {
  if (localStorage.getItem("isAdmin") === "true") {
    return true;
  }

  return Boolean(readCurrentUser()?.admin);
}

export function clearAuthSession() {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAdmin");
}
