import { z } from "zod";

export const foodLogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
});
