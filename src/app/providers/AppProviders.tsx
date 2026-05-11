import type { ReactNode } from "react";

import { FoodLogProvider } from "../../features/food/store/FoodLogContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <FoodLogProvider>{children}</FoodLogProvider>;
}
