import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId;
    const startValue = startValueRef.current;
    const targetValue = value || 0;
    const change = targetValue - startValue;

    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const timeElapsed = timestamp - startTime;
      const progress = Math.min(timeElapsed / duration, 1); 
      
      const easedProgress = easeOutExpo(progress);
      const currentValue = startValue + (change * easedProgress);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        startValueRef.current = targetValue;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{displayValue.toFixed(2)}</span>;
}