import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = ['#1a56db', '#0e9f6e', '#f59e0b', '#8b5cf6'];

// datasets: [{ label, data: [..], color? }]. null value = bar nahi dekhay
export default function BarChart({ labels, datasets, height = 280, max, unit = '' }) {
  const data = {
    labels,
    datasets: datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color || COLORS[i % COLORS.length],
      borderRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: datasets.length > 1 },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y ?? 0}${unit}` },
      },
    },
    scales: {
      y: { beginAtZero: true, ...(max && { max }), ticks: { precision: 0 } },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}