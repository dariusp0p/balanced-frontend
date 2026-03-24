import { Link } from "react-router";

interface FoodLogItemProps {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export function FoodLogItem({ id, name, time, calories, protein, carbs, fats }: FoodLogItemProps) {
  return (
    <Link to={`/food/${id}`}>
      <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        {/* Image placeholder */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{time}</p>
            </div>
            <div className="text-[#E89B7E] font-medium">{calories} cals</div>
          </div>
          
          {/* Macros */}
          <div className="flex gap-4 text-xs">
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
      </div>
    </Link>
  );
}