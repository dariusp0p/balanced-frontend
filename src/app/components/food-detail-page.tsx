import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Mock data - in a real app this would come from a database
const foodData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Avocado Toast & Eggs",
    time: "10:48",
    date: "March 17, 2026",
    calories: 438,
    protein: 186,
    carbs: 198,
    fats: 78,
    servingSize: "1 plate",
    ingredients: ["2 eggs", "1/2 avocado", "2 slices whole wheat bread", "olive oil", "salt & pepper"],
  },
  "2": {
    id: 2,
    name: "Avocado Toast & Eggs",
    time: "10:48",
    date: "March 17, 2026",
    calories: 438,
    protein: 186,
    carbs: 198,
    fats: 78,
    servingSize: "1 plate",
    ingredients: ["2 eggs", "1/2 avocado", "2 slices whole wheat bread", "olive oil", "salt & pepper"],
  },
  "3": {
    id: 3,
    name: "Avocado Toast & Eggs",
    time: "10:48",
    date: "March 17, 2026",
    calories: 438,
    protein: 186,
    carbs: 198,
    fats: 78,
    servingSize: "1 plate",
    ingredients: ["2 eggs", "1/2 avocado", "2 slices whole wheat bread", "olive oil", "salt & pepper"],
  },
};

export function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const food = foodData[id || "1"];

  if (!food) {
    return <div>Food not found</div>;
  }

  // Calculate macro percentages and calories
  const totalMacroGrams = food.protein + food.carbs + food.fats;
  const proteinPercentage = ((food.protein / totalMacroGrams) * 100).toFixed(1);
  const carbsPercentage = ((food.carbs / totalMacroGrams) * 100).toFixed(1);
  const fatsPercentage = ((food.fats / totalMacroGrams) * 100).toFixed(1);

  // Calories from each macro (protein: 4 cal/g, carbs: 4 cal/g, fats: 9 cal/g)
  const proteinCals = food.protein * 4;
  const carbsCals = food.carbs * 4;
  const fatsCals = food.fats * 9;

  const pieData = [
    { name: "Protein", value: food.protein, color: "#E89B7E" },
    { name: "Carbs", value: food.carbs, color: "#D1D5DB" },
    { name: "Fats", value: food.fats, color: "#3B7B8F" },
  ];

  const barData = [
    { name: "Protein", grams: food.protein, calories: proteinCals },
    { name: "Carbs", grams: food.carbs, calories: carbsCals },
    { name: "Fats", grams: food.fats, calories: fatsCals },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-[#1E3A5F] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Food Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{food.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{food.date}</span>
                <span>•</span>
                <span>{food.time}</span>
                <span>•</span>
                <span>{food.servingSize}</span>
              </div>
              <div className="text-3xl font-semibold text-[#E89B7E]">{food.calories} calories</div>
            </div>
          </div>
        </div>

        {/* Macro Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Macro Distribution</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#E89B7E]" />
                  <span className="font-medium">Protein</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{food.protein}g</div>
                  <div className="text-sm text-gray-500">{proteinPercentage}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                  <span className="font-medium">Carbs</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{food.carbs}g</div>
                  <div className="text-sm text-gray-500">{carbsPercentage}%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#3B7B8F]" />
                  <span className="font-medium">Fats</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">{food.fats}g</div>
                  <div className="text-sm text-gray-500">{fatsPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calorie Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Calorie Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#E89B7E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Protein</div>
              <div className="font-semibold text-lg">{proteinCals} cal</div>
              <div className="text-xs text-gray-400">4 cal/g</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Carbs</div>
              <div className="font-semibold text-lg">{carbsCals} cal</div>
              <div className="text-xs text-gray-400">4 cal/g</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fats</div>
              <div className="font-semibold text-lg">{fatsCals} cal</div>
              <div className="text-xs text-gray-400">9 cal/g</div>
            </div>
          </div>
        </div>

        {/* Nutritional Facts */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nutritional Facts</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Calories</span>
              <span className="font-medium">{food.calories} kcal</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Protein</span>
              <span className="font-medium">{food.protein}g</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Carbohydrates</span>
              <span className="font-medium">{food.carbs}g</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Fats</span>
              <span className="font-medium">{food.fats}g</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Serving Size</span>
              <span className="font-medium">{food.servingSize}</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {food.ingredients.map((ingredient: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E89B7E]" />
                <span className="text-gray-700">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
