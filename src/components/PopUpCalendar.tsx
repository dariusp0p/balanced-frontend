import { Calendar } from "lucide-react";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";

export function PopUpCalendar({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  // Placeholder: Replace with a real calendar UI or a library like react-day-picker
  // For now, just a simple input
  return (
    <div className="absolute z-10 bg-white border rounded shadow p-2 mt-2">
      <input
        type="date"
        value={format(value, "yyyy-MM-dd")}
        onChange={e => onChange(new Date(e.target.value))}
        className="border p-1 rounded"
      />
    </div>
  );
}
