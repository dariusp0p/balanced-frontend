import { createBrowserRouter } from "react-router";
import { LoginPage } from "../features/auth/views/login-page";
import { SignupPage } from "../features/auth/views/signup-page";
import { DashboardPage } from "../features/dashboard/views/DashboardPage";
import { LogFoodPage } from "../features/food/views/AddFoodLogPage";
import { InfiniteFoodLogsPage } from "../features/food/views/InfiniteFoodLogsPage";
import { FoodDetailPage } from "../features/food/views/FoodDetailPage";
import { CameraCapture } from "../features/food/views/CameraCapture";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
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
]);
