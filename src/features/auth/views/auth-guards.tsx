import { Navigate, Outlet } from "react-router";
import { isAdminUser, isAuthenticated } from "../services/authSession";

export function RedirectIfAuthenticated() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export function RequireAuth() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
}

export function RequireAdmin() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return isAdminUser() ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
