import { createBrowserRouter } from "react-router";
import { LoginPage } from "./features/auth/login-page";
import { SignupPage } from "./features/auth/signup-page";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { LogFoodPage } from "./features/food/LogFoodPage";
import { FoodDetailPage } from "./components/food-detail-page";
import { CameraCapture } from "./components/camera-capture";

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
    path: "/log-food",
    Component: LogFoodPage,
  },
]);
