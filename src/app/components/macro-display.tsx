interface MacroDisplayProps {
  protein: number;
  carbs: number;
  fats: number;
  layout?: "horizontal" | "vertical";
}

export function MacroDisplay({ protein, carbs, fats, layout = "horizontal" }: MacroDisplayProps) {
  const containerClass = layout === "horizontal" 
    ? "flex gap-8 justify-center" 
    : "grid grid-cols-3 gap-4";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="text-2xl font-semibold text-[#E89B7E]">{protein}g</div>
        <div className="text-xs text-gray-400">protein</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-gray-300">{carbs}g</div>
        <div className="text-xs text-gray-400">carbs</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-[#3B7B8F]">{fats}g</div>
        <div className="text-xs text-gray-400">fats</div>
      </div>
    </div>
  );
}
