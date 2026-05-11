import type { ChangeEvent, FormEvent } from "react";

export type FoodLogFormValues = {
  name: string;
  date: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

type FoodLogFormProps = {
  form: FoodLogFormValues;
  error: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
};

export function FoodLogForm({
  form,
  error,
  onChange,
  onSubmit,
  submitLabel = "Save",
}: FoodLogFormProps) {
  return (
    <form
      className="space-y-4 rounded-xl bg-dark-blue/80 p-4"
      onSubmit={onSubmit}
    >
      <input
        className="w-full min-w-0 rounded p-2 text-white placeholder:text-gray-300 border border-dark-blue bg-darker-blue"
        name="name"
        placeholder="Food name"
        value={form.name}
        onChange={onChange}
        required
      />
      <input
        className="w-full min-w-0 rounded p-2 text-white border border-dark-blue bg-darker-blue"
        name="date"
        type="date"
        value={form.date}
        onChange={onChange}
        required
      />
      <input
        className="w-full min-w-0 rounded p-2 text-white placeholder:text-gray-300 border border-dark-blue bg-darker-blue"
        name="calories"
        type="number"
        placeholder="Calories"
        value={form.calories}
        onChange={onChange}
        required
      />
      <input
        className="w-full min-w-0 rounded p-2 text-white placeholder:text-gray-300 border border-dark-blue bg-darker-blue"
        name="protein"
        type="number"
        placeholder="Protein (g)"
        value={form.protein}
        onChange={onChange}
        required
      />
      <input
        className="w-full min-w-0 rounded p-2 text-white placeholder:text-gray-300 border border-dark-blue bg-darker-blue"
        name="carbs"
        type="number"
        placeholder="Carbs (g)"
        value={form.carbs}
        onChange={onChange}
        required
      />
      <input
        className="w-full min-w-0 rounded p-2 text-white placeholder:text-gray-300 border border-dark-blue bg-darker-blue"
        name="fats"
        type="number"
        placeholder="Fats (g)"
        value={form.fats}
        onChange={onChange}
        required
      />
      {error && <div className="mb-2 text-sm font-medium text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full rounded bg-orange py-2 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
