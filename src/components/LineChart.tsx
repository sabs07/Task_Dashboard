import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Task } from '../types/models';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  tasks: Task[];
}

const getDailyCompletion = (tasks: Task[]) => {
  const completed = tasks.filter(t => t.status === 'completed' && t.completedAt);
  const counts: { [date: string]: number } = {};
  completed.forEach(t => {
    if (t.completedAt) {
      counts[t.completedAt] = (counts[t.completedAt] || 0) + 1;
    }
  });
  const sortedDates = Object.keys(counts).sort();
  return {
    labels: sortedDates,
    data: sortedDates.map(date => counts[date]),
  };
};

const LineChart: React.FC<LineChartProps> = ({ tasks }) => {
  const chartRef = useRef<any>(null);
  const { labels, data } = getDailyCompletion(tasks);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBackgroundColor: '#2563eb',
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

  return <Line ref={chartRef} data={chartData} options={options} />;
};

export default LineChart; 