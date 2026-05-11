export type FoodLogMode = "ai" | "my-foods" | "foods" | "manual";

type FoodLogModeNavProps = {
  selectedMode: FoodLogMode;
  onSelectMode: (mode: FoodLogMode) => void;
};

const MODES: Array<{ id: FoodLogMode; label: string }> = [
  { id: "ai", label: "AI Analysis" },
  { id: "my-foods", label: "My Foods" },
  { id: "foods", label: "Foods" },
  { id: "manual", label: "Manual" },
];

export function FoodLogModeNav({
  selectedMode,
  onSelectMode,
}: FoodLogModeNavProps) {
  return (
    <nav className="mb-6 border-b border-white/10 bg-dark-blue">
      <div className="grid w-full grid-cols-4 items-end">
        {MODES.map((mode) => {
          const isSelected = mode.id === selectedMode;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`min-w-0 border-b-2 px-2 pb-3 text-center text-sm font-semibold transition-colors ${
                isSelected
                  ? "border-orange text-white"
                  : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
