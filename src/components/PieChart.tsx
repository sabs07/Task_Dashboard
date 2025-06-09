import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Task } from '../types/models';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  tasks: Task[];
}

const PieChart: React.FC<PieChartProps> = ({ tasks }) => {
  const priorityCounts = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as { [priority: string]: number });

  const chartData = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(priorityCounts),
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
      },
    ],
  };
  return <Pie data={chartData} />;
};

export default PieChart; 