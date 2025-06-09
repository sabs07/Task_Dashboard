import React from 'react';
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
      },
    ],
  };
  return <Line data={chartData} />;
};

export default LineChart; 