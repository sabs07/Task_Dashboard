import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Task } from '../types/models';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  tasks: Task[];
}

const BarChart: React.FC<BarChartProps> = ({ tasks }) => {
  const chartRef = useRef<any>(null);
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
        hoverBackgroundColor: ['#1d4ed8', '#dc2626'],
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value} tasks`;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 18,
          font: { size: 14 },
        },
      },
    },
    onClick: (e: any, elements: any[]) => {
      if (elements && elements.length > 0 && chartRef.current) {
        const chart = chartRef.current;
        const idx = elements[0].index;
        const label = chartData.labels[idx];
        const value = chartData.datasets[0].data[idx];
        alert(`You clicked on ${label}: ${value} tasks`);
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true,
    },
  };

  return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default BarChart; 