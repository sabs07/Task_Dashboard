import React, { useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Task } from '../types/models';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  tasks: Task[];
}

const PieChart: React.FC<PieChartProps> = ({ tasks }) => {
  const chartRef = useRef<any>(null);
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
        hoverOffset: 16,
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
            const value = context.parsed || 0;
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

  return <Pie ref={chartRef} data={chartData} options={options} />;
};

export default PieChart; 