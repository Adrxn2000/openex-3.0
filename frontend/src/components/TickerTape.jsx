import { useEffect, useState } from 'react';

// A live scrolling ticker strip, the kind you'd see on a real exchange floor.
// Repeats the same feed item enough times to fill a seamless marquee loop.
function TickerTape() {
  const [price, setPrice] = useState(null);
  const [changePct, setChangePct] = useState(0);

  useEffect(() => {
    function fetchTicks() {
      fetch('http://localhost:5001/api/market/ticks')
        .then((res) => res.json())
        .then((ticks) => {
          if (!ticks.length) return;
          const first = ticks[0].price;
          const last = ticks[ticks.length - 1].price;
          setPrice(last);
          setChangePct(((last - first) / first) * 100);
        })
        .catch(() => {});
    }
    fetchTicks();
    const interval = setInterval(fetchTicks, 5000);
    return () => clearInterval(interval);
  }, []);

  if (price === null) return null;

  const up = changePct >= 0;

  return (
    <div className="ticker-tape">
      <div className="ticker-tape-track">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="ticker-item" key={i}>
            <span className="sym">BTC/USD</span>
            <span className="px">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className={`chg ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TickerTape;