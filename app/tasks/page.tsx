import TasksClient from '../../src/components/TasksClient';
import { Metadata } from 'next';
import ProfileClient from '../../src/components/ProfileClient';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: 'All Tasks | Task Manager',
  description: 'View, filter, and manage all your tasks with analytics and charts.',
  openGraph: {
    title: 'All Tasks | Task Manager',
    description: 'View, filter, and manage all your tasks with analytics and charts.',
    url: 'https://your-vercel-url.com/tasks',
    siteName: 'Task Manager',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'All Tasks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

async function getTasks() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/tasks`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TasksPage() {
  const tasks = await getTasks();
  return <TasksClient tasks={tasks} />;
} 