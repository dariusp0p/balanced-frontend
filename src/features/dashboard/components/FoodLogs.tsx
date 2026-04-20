import { FoodLogItem } from "./FoodLogItem";
import { useFoodLogs } from "../../food/FoodLogContext";
import type { FoodLog } from "../../food/FoodLogContext";

interface FoodLogsProps {
  foodLogs: FoodLog[];
  onAdd: () => void;
}

export function FoodLogs({ foodLogs, onAdd }: FoodLogsProps) {
  const { deleteFoodLog } = useFoodLogs();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-4 px-0 md:px-0">
        <h2 className="text-lg md:text-sm font-medium text-gray-600">
          today's logs
        </h2>
        <button
          type="button"
          className="text-orange text-sm hover:underline"
          onClick={onAdd}
        >
          add +
        </button>
      </div>

      <div className="space-y-4 md:space-y-3 flex flex-col gap-2">
        {foodLogs.map((log, idx) => (
          <div
            key={log.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            <FoodLogItem {...log} onDelete={deleteFoodLog} />
          </div>
        ))}
      </div>
    </div>
  );
}
