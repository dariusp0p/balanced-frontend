import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { useFoodLogs } from "../store/FoodLogContext";
import { foodLogSchema } from "../utils/foodLogValidation";
import { AiFoodLogContent } from "./components/AiFoodLogContent";
import { FoodLogModeNav, type FoodLogMode } from "./components/FoodLogModeNav";
import { ManualFoodLogContent } from "./components/ManualFoodLogContent";
import { UnavailableFoodLogContent } from "./components/UnavailableFoodLogContent";

const VALID_MODES: FoodLogMode[] = ["ai", "my-foods", "foods", "manual"];

export function LogFoodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");
  const modeParam = params.get("mode");
  const dateParam = params.get("date");
  const groupIdParam = params.get("groupId");
  const parsedGroupIdParam = groupIdParam ? Number(groupIdParam) : null;
  const selectedGroupId = Number.isFinite(parsedGroupIdParam)
    ? parsedGroupIdParam
    : null;
  const selectedMode: FoodLogMode = VALID_MODES.includes(modeParam as FoodLogMode)
    ? (modeParam as FoodLogMode)
    : "manual";
  const selectedDate = dateParam || format(new Date(), "yyyy-MM-dd");
  const { foodLogs, addFoodLog, updateFoodLog } = useFoodLogs();
  const foodToEdit = editId
    ? foodLogs.find((log) => log.id === Number(editId))
    : null;

  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: selectedDate,
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  // Pre-populate form if editing
  useEffect(() => {
    if (foodToEdit) {
      setForm({
        name: foodToEdit.name,
        date: foodToEdit.date,
        calories: String(foodToEdit.calories),
        protein: String(foodToEdit.protein),
        carbs: String(foodToEdit.carbs),
        fats: String(foodToEdit.fats),
      });
      return;
    }
    setForm((current) => ({
      ...current,
      date: selectedDate,
    }));
  }, [foodToEdit, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveGroupId = selectedGroupId ?? foodToEdit?.logGroupId ?? null;
    const currentTime = format(new Date(), "HH:mm");
    const parsed = foodLogSchema.safeParse({
      name: form.name,
      date: form.date,
      time: currentTime,
      logGroupId: effectiveGroupId,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fats: Number(form.fats),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(", "));
      return;
    }
    if (foodToEdit) {
      updateFoodLog(foodToEdit.id, parsed.data);
    } else {
      addFoodLog(parsed.data);
    }
    navigate("/dashboard");
  };

  const navigateToMode = (mode: FoodLogMode) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("mode", mode);
    navigate(`/log-food?${nextParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col overflow-x-hidden">
      <div className="px-4 py-4 text-white">
        <div className="mx-auto flex w-full max-w-md items-center justify-center relative">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold text-center">Log Food</h1>
        </div>
      </div>
      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-md">
          <FoodLogModeNav
            selectedMode={selectedMode}
            onSelectMode={navigateToMode}
          />

          {selectedMode === "manual" && (
            <ManualFoodLogContent
              form={form}
              error={error}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          )}

          {selectedMode === "ai" && (
            <AiFoodLogContent
              form={form}
              error={error}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onOpenCamera={() => navigate("/camera")}
            />
          )}

          {selectedMode === "my-foods" && (
            <UnavailableFoodLogContent title="My Foods" />
          )}

          {selectedMode === "foods" && (
            <UnavailableFoodLogContent title="Foods" />
          )}
        </div>
      </div>
    </div>
  );
}
