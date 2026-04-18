import { Link } from "react-router";
import { Trash2 } from "lucide-react";

interface FoodLogItemProps {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  onDelete: (id: number) => void;
}

export function FoodLogItem({
  id,
  name,
  time,
  calories,
  protein,
  carbs,
  fats,
  onDelete,
}: FoodLogItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete(id);
  };

  return (
    <Link to={`/food/${id}`}>
      <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <span className="text-orange font-medium">{calories} cals</span>
          </div>
          <p className="text-sm text-gray-500">{time}</p>

          <div className="flex gap-4 text-xs mt-2">
            <div>
              <span className="font-medium text-gray-900">{protein}g</span>
              <span className="text-gray-400 ml-1">protein</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">{carbs}g</span>
              <span className="text-gray-400 ml-1">carbs</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">{fats}g</span>
              <span className="text-gray-400 ml-1">fats</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="delete-food-log"
          onClick={handleDelete}
          className="ml-2 p-2 rounded hover:bg-red-100 group"
          title="Delete"
        >
          <Trash2 className="text-gray-400 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </Link>
  );
}
