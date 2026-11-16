import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#1a56db', '#0e9f6e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

export default function DoughnutChart({ labels, data, height = 280 }) {
  const chartData = {
    labels,
    datasets: [{ data, backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]) }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}