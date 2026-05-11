import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import { useFoodLogs } from "../store/FoodLogContext";
import { foodLogSchema } from "../utils/foodLogValidation";

export function LogFoodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");
  const groupIdParam = params.get("groupId");
  const parsedGroupIdParam = groupIdParam ? Number(groupIdParam) : null;
  const selectedGroupId = Number.isFinite(parsedGroupIdParam)
    ? parsedGroupIdParam
    : null;
  const { foodLogs, addFoodLog, updateFoodLog } = useFoodLogs();
  const foodToEdit = editId
    ? foodLogs.find((log) => log.id === Number(editId))
    : null;

  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
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
        time: foodToEdit.time,
        calories: String(foodToEdit.calories),
        protein: String(foodToEdit.protein),
        carbs: String(foodToEdit.carbs),
        fats: String(foodToEdit.fats),
      });
    }
  }, [foodToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveGroupId = selectedGroupId ?? foodToEdit?.logGroupId ?? null;
    const parsed = foodLogSchema.safeParse({
      name: form.name,
      date: form.date,
      time: form.time,
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

  const handleAI = () => {
    navigate("/log-food?mode=ai");
  };

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col overflow-x-hidden">
      <div className="text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Log Food</h1>
        <button onClick={() => navigate("/dashboard")}>Close</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button
            className="w-full mb-6 bg-orange text-white py-2 rounded font-semibold"
            onClick={handleAI}
          >
            AI Analysis
          </button>
          <form
            className="space-y-4 p-4 rounded-xl bg-dark-blue/80"
            onSubmit={handleSubmit}
          >
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2 placeholder:text-gray-300"
              name="name"
              placeholder="Food name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2 placeholder:text-gray-300"
              name="calories"
              type="number"
              placeholder="Calories"
              value={form.calories}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2 placeholder:text-gray-300"
              name="protein"
              type="number"
              placeholder="Protein (g)"
              value={form.protein}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2 placeholder:text-gray-300"
              name="carbs"
              type="number"
              placeholder="Carbs (g)"
              value={form.carbs}
              onChange={handleChange}
              required
            />
            <input
              className="w-full min-w-0 border border-dark-blue bg-darker-blue text-white rounded p-2 placeholder:text-gray-300"
              name="fats"
              type="number"
              placeholder="Fats (g)"
              value={form.fats}
              onChange={handleChange}
              required
            />
            {error && (
              <div className="mb-2 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-orange text-white py-2 rounded font-semibold"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
