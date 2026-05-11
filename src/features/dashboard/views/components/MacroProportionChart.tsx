import React, { useEffect, useState } from "react";

type Props = {
  protein: number;
  carbs: number;
  fats: number;
  size?: number;
  durationMs?: number;
};

const COLORS = {
  protein: "#f59e42",
  carbs: "#d1d5db",
  fats: "#3B7B8F",
};

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

export function MacroProportionChart({
  protein,
  carbs,
  fats,
  size = 100,
  durationMs = 900,
}: Props) {
  const total = protein + carbs + fats || 1;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / durationMs, 1);
      setProgress(pct);
      if (pct < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [protein, carbs, fats, durationMs]);

  const proteinPct = (protein / total) * progress;
  const carbsPct = (carbs / total) * progress;
  const fatsPct = (fats / total) * progress;

  const slices = [
    { pct: proteinPct, color: COLORS.protein },
    { pct: carbsPct, color: COLORS.carbs },
    { pct: fatsPct, color: COLORS.fats },
  ];

  let cumulativePct = 0;
  const paths = slices.map((slice, i) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePct);
    cumulativePct += slice.pct;
    const [endX, endY] = getCoordinatesForPercent(cumulativePct);
    const largeArcFlag = slice.pct > 0.5 ? 1 : 0;
    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(" ");
    return (
      <path
        key={i}
        d={pathData}
        fill={slice.color}
        stroke="#fff"
        strokeWidth={0.02}
      />
    );
  });

  return (
    <svg
      viewBox="-1.1 -1.1 2.2 2.2"
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
    >
      {paths}
    </svg>
  );
}
