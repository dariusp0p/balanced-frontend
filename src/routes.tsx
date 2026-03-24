import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/login-page";
import { SignupPage } from "./components/signup-page";
import { DashboardPage } from "./components/dashboard-page";
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
]);