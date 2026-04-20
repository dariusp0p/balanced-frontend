import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { format, isToday, isYesterday, subDays, addDays } from "date-fns";
import { PopUpCalendar } from "../../../components/PopUpCalendar";

export function DateNavigation({
  initialDate,
  onDateChange,
}: {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
} = {}) {
  const [date, setDate] = useState<Date>(initialDate || new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleChange = (newDate: Date) => {
    setDate(newDate);
    setShowCalendar(false);
    onDateChange?.(newDate);
  };

  const goPrev = () => handleChange(subDays(date, 1));
  const goNext = () => handleChange(addDays(date, 1));

  let label = format(date, "PPP");
  let subLabel: string | null = null;
  if (isToday(date)) {
    label = "Today";
    subLabel = format(date, "PPP");
  } else if (isYesterday(date)) {
    label = "Yesterday";
    subLabel = format(date, "PPP");
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-6 relative">
      <button
        className="hover:bg-gray-100 p-1 rounded"
        onClick={goPrev}
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium">{label}</span>
        {subLabel && (
          <span
            className="text-xs text-gray-500"
            style={{ fontSize: "0.75em" }}
          >
            {subLabel}
          </span>
        )}
      </div>
      <button
        className="hover:bg-gray-100 p-1 rounded"
        onClick={() => setShowCalendar((v) => !v)}
        aria-label="Open calendar"
      >
        <Calendar className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      <button
        className="hover:bg-gray-100 p-1 rounded"
        onClick={goNext}
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      {showCalendar && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-20">
          <PopUpCalendar value={date} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}
