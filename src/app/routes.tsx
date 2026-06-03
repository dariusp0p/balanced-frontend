import { createBrowserRouter, Outlet } from "react-router";
import { AppProviders } from "./providers/AppProviders";
import { LoginPage } from "../features/auth/views/login-page";
import { SignupPage } from "../features/auth/views/signup-page";
import { ForgotPasswordPage } from "../features/auth/views/forgot-password-page";
import {
  RedirectIfAuthenticated,
  RequireAdmin,
  RequireAuth,
} from "../features/auth/views/auth-guards";
import { DashboardPage } from "../features/dashboard/views/DashboardPage";
import { LogFoodPage } from "../features/food/views/AddFoodLogPage";
import { InfiniteFoodLogsPage } from "../features/food/views/InfiniteFoodLogsPage";
import { FoodDetailPage } from "../features/food/views/FoodDetailPage";
import { CameraCapture } from "../features/food/views/CameraCapture";
import { FriendsPage } from "../features/friends/views/FriendsPage";
import { SettingsPage } from "../features/settings/views/SettingsPage";
import { AppLogsPage } from "../features/admin/views/AppLogsPage";

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        path: "/",
        Component: LoginPage,
      },
      {
        path: "/signup",
        Component: SignupPage,
      },
      {
        path: "/forgot-password",
        Component: ForgotPasswordPage,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: (
          <AppProviders>
            <Outlet />
          </AppProviders>
        ),
        children: [
          {
            path: "/dashboard",
            Component: DashboardPage,
          },
          {
            path: "/friends",
            Component: FriendsPage,
          },
          {
            path: "/settings",
            Component: SettingsPage,
          },
          {
            path: "/camera",
            Component: CameraCapture,
          },
          {
            path: "/food/:id",
            Component: FoodDetailPage,
          },
          {
            path: "/food/add",
            Component: LogFoodPage,
          },
          {
            path: "/log-food",
            Component: LogFoodPage,
          },
          {
            path: "/infinite-food-logs",
            Component: InfiniteFoodLogsPage,
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: "/admin/logs",
                Component: AppLogsPage,
              },
            ],
          },
        ],
      },
    ],
  },
]);
