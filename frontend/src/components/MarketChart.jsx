import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import AnimatedNumber from './AnimatedNumber';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

function MarketChart() {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    function fetchTicks() {
      fetch('http://localhost:5001/api/market/ticks')
        .then((res) => res.json())
        .then(setTicks)
        .catch(() => {});
    }

    fetchTicks();
    const interval = setInterval(fetchTicks, 5000);
    return () => clearInterval(interval);
  }, []);

  const prices = ticks.map((t) => t.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const trendUp = prices.length > 1 && last >= first;
  const changePct = prices.length > 1 ? ((last - first) / first) * 100 : 0;
  const lineColor = trendUp ? '#22C55E' : '#F0525B';

  const data = {
    labels: ticks.map((_, i) => i),
    datasets: [
      {
        label: 'BTC/USD',
        data: prices,
        borderColor: lineColor,
        backgroundColor: trendUp ? 'rgba(34, 197, 94, 0.08)' : 'rgba(240, 82, 91, 0.08)',
        fill: true,
        tension: 0.15,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: '10-tick MA',
        data: ticks.map((t) => t.moving_avg_10 || null),
        borderColor: '#4E5867',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: { duration: 400 },
    plugins: {
      legend: { labels: { color: '#8891A0', font: { family: 'JetBrains Mono', size: 11 } } },
    },
    scales: {
      x: { ticks: { color: '#4E5867' }, grid: { color: '#1A2230' } },
      y: {
        ticks: { color: '#4E5867', font: { family: 'JetBrains Mono', size: 11 }, callback: (v) => '$' + v.toLocaleString() },
        grid: { color: '#1A2230' },
      },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>BTC / USD</h3>
          <span className="live-label">Simulated market feed</span>
        </div>
        {last != null && (
          <div className="price-readout">
            <AnimatedNumber value={last} decimals={2} prefix="$" className="price-big" />
            <span className={`chg-badge ${trendUp ? 'up' : 'down'}`}>
              {trendUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

export default MarketChart;