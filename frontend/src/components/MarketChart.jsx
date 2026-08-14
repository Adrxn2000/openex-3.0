import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

function MarketChart() {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/market/ticks')
      .then((res) => res.json())
      .then(setTicks)
      .catch(() => {});
  }, []);

  const data = {
    labels: ticks.map((_, i) => i),
    datasets: [{ label: 'Price (ZAR)', data: ticks.map((t) => t.price), borderColor: 'green' }],
  };

  return <Line data={data} />;
}

export default MarketChart;