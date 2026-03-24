import { FoodLogItem } from "./FoodLogItem";

interface FoodLogsProps {
  foodLogs: Array<{
    id: number;
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
  onAdd: () => void;
}

export function FoodLogs({ foodLogs, onAdd }: FoodLogsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-4 px-0 md:px-0">
        <h2 className="text-lg md:text-sm font-medium text-gray-600">
          today's logs
        </h2>
        <button className="text-orange text-sm hover:underline" onClick={onAdd}>
          add +
        </button>
      </div>
      <div className="space-y-4 md:space-y-3">
        {foodLogs.map((log) => (
          <FoodLogItem key={log.id} {...log} />
        ))}
      </div>
    </div>
  );
}
