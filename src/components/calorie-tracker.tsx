interface CalorieTrackerProps {
  current: number;
  goal: number;
}

export function CalorieTracker({ current, goal }: CalorieTrackerProps) {
  const remaining = goal - current;
  const percentage = (current / goal) * 100;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="#3B7B8F"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold text-gray-900">{current}</div>
        <div className="text-sm text-gray-500">of {goal} cals</div>
        <div className="text-xs text-gray-400 mt-1">{remaining} cal remaining</div>
      </div>
    </div>
  );
}
