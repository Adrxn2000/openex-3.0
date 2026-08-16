import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';

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
  const trendUp = prices.length > 1 && prices[prices.length - 1] >= prices[0];
  const lineColor = trendUp ? '#10B981' : '#EF4444';

  const data = {
    labels: ticks.map((_, i) => i),
    datasets: [
      {
        label: 'BTC/USD',
        data: prices,
        borderColor: lineColor,
        backgroundColor: trendUp ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.15,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: '10-tick MA',
        data: ticks.map((t) => t.moving_avg_10 || null),
        borderColor: '#64748B',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94A3B8' } } },
    scales: {
      x: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' } },
       y: { ticks: { color: '#64748B', callback: (v) => '$' + v.toLocaleString() }, grid: { color: '#1E293B' } },
    },
  };

  return (
    <div style={{ background: '#1E293B', borderRadius: 12, padding: 20, marginTop: 20 }}>
      <h3 style={{ color: '#FFFFFF', marginTop: 0, marginBottom: 16 }}>Market Price (live)</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default MarketChart;