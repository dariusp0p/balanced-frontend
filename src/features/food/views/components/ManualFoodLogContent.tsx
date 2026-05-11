import type { ChangeEvent, FormEvent } from "react";
import { FoodLogForm, type FoodLogFormValues } from "./FoodLogForm";

type ManualFoodLogContentProps = {
  form: FoodLogFormValues;
  error: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
};

export function ManualFoodLogContent({
  form,
  error,
  onChange,
  onSubmit,
}: ManualFoodLogContentProps) {
  return (
    <FoodLogForm form={form} error={error} onChange={onChange} onSubmit={onSubmit} />
  );
}
