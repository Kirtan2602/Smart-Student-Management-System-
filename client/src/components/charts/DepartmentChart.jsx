import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function DepartmentChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.code),
    datasets: [
      {
        label: 'Students',
        data: data.map((d) => d.students),
        backgroundColor: '#1a56db',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: { title: (items) => data[items[0].dataIndex].name },
      },
    },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div style={{ height: 280 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}