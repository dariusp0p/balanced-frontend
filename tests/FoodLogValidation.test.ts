import { foodLogSchema } from "../src/features/food/foodLogValidation";

const valid = {
  name: "Eggs",
  time: "09:00",
  date: "2024-03-30",
  calories: 100,
  protein: 10,
  carbs: 5,
  fats: 7,
};

test("validates correct food log", () => {
  expect(foodLogSchema.safeParse(valid).success).toBe(true);
});

test("rejects missing name", () => {
  const invalid = { ...valid, name: "" };
  expect(foodLogSchema.safeParse(invalid).success).toBe(false);
});

test("rejects invalid time", () => {
  const invalid = { ...valid, time: "9am" };
  expect(foodLogSchema.safeParse(invalid).success).toBe(false);
});

test("rejects negative macros", () => {
  const invalid = { ...valid, protein: -1 };
  expect(foodLogSchema.safeParse(invalid).success).toBe(false);
});
