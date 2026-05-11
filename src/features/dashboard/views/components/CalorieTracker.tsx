import React, { useEffect, useState } from "react";

interface CalorieTrackerProps {
  current: number;
  goal: number;
}

export function CalorieTracker({ current, goal }: CalorieTrackerProps) {
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Animation duration in ms
  const duration = 900;

  useEffect(() => {
    let start: number | null = null;
    let animationFrame: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);

      setAnimatedCurrent(Math.round(current * pct));
      setAnimatedPercent((current / goal) * pct);

      if (pct < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setAnimatedCurrent(current);
        setAnimatedPercent(current / goal);
      }
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [current, goal]);

  const remaining = goal - animatedCurrent;
  const percentage = Math.min(animatedPercent * 100, 100);
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
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold text-gray-900">
          {animatedCurrent}
        </div>
        <div className="text-sm text-gray-500">of {goal} cals</div>
        <div className="text-xs text-gray-400 mt-1">
          {remaining} cal remaining
        </div>
      </div>
    </div>
  );
}
