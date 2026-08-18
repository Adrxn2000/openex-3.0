import { useEffect, useRef, useState } from 'react';

// Smoothly counts up/down to `value`, and briefly flashes green/red
// on change — the same micro-interaction used for balances and prices.
function AnimatedNumber({ value, decimals = 2, prefix = '', duration = 500, className = '' }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState('');
  const prevValue = useRef(value);
  const frameRef = useRef();

  useEffect(() => {
    if (value === prevValue.current || Number.isNaN(value)) return;
    const from = prevValue.current;
    const to = value;
    setFlash(to > from ? 'flash-up' : 'flash-down');

    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(from + (to - from) * progress);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = to;
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    const flashTimeout = setTimeout(() => setFlash(''), 700);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(flashTimeout);
    };
  }, [value, duration]);

  return (
    <span className={`${className} ${flash}`}>
      {prefix}
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

export default AnimatedNumber;