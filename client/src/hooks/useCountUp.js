import { useState, useEffect, useRef } from 'react';

export const useCountUp = (target, duration = 700) => {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const diff = target - from;
    if (diff === 0) return;
    const t0 = performance.now();

    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      // easeOutQuart for a fast start and smooth landing
      const eased = 1 - Math.pow(1 - p, 4); 
      setDisplay(from + diff * eased);
      
      if (p < 1) { 
        rafRef.current = requestAnimationFrame(tick); 
      } else { 
        prevRef.current = target; 
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
};