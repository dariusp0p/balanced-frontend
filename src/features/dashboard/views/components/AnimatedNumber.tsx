import React, { useEffect, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 900,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let animationFrame: number;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(value * pct));
      if (pct < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{display}</>;
}
