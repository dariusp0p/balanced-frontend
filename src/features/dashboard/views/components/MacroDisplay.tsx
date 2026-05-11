import { AnimatedNumber } from "./AnimatedNumber"; // adjust path as needed

interface MacroDisplayProps {
  protein: number;
  carbs: number;
  fats: number;
  layout?: "horizontal" | "vertical";
}

export function MacroDisplay({
  protein,
  carbs,
  fats,
  layout = "horizontal",
}: MacroDisplayProps) {
  const containerClass =
    layout === "horizontal"
      ? "flex gap-8 justify-center"
      : "flex flex-col gap-4 items-center";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="text-2xl font-semibold text-orange">
          <AnimatedNumber value={protein} />g
        </div>
        <div className="text-xs text-gray-400">protein</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-gray-300">
          <AnimatedNumber value={carbs} />g
        </div>
        <div className="text-xs text-gray-400">carbs</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-[#3B7B8F]">
          <AnimatedNumber value={fats} />g
        </div>
        <div className="text-xs text-gray-400">fats</div>
      </div>
    </div>
  );
}
