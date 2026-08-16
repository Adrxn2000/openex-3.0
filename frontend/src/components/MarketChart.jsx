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

  const data = {
    labels: ticks.map((_, i) => i),
    datasets: [
      {
        label: 'Price (USD)',
        data: ticks.map((t) => t.price),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94A3B8' } } },
    scales: {
      x: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' } },
      y: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' } },
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