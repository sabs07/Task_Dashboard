import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Task } from '../types/models';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  tasks: Task[];
}

const BarChart: React.FC<BarChartProps> = ({ tasks }) => {
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as { [status: string]: number });

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Tasks by Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };
  return <Bar data={chartData} />;
};

export default BarChart; 