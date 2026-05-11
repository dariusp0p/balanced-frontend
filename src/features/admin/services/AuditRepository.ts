import { apiRequest } from "../../../shared/services/apiClient";
import type { AppActionLog, ObservedUser } from "../types/audit";

export function fetchAppLogs() {
  return apiRequest<AppActionLog[]>("/api/admin/logs?page=0&size=100");
}

export function fetchObservedUsers() {
  return apiRequest<ObservedUser[]>("/api/admin/observed-users");
}
