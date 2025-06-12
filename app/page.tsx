import DashboardClient from '../src/components/DashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: 'Task Dashboard | Task Manager',
  description: 'Manage your tasks efficiently with a beautiful dashboard, charts, and quick actions.',
  openGraph: {
    title: 'Task Dashboard | Task Manager',
    description: 'Manage your tasks efficiently with a beautiful dashboard, charts, and quick actions.',
    url: 'https://your-vercel-url.com/',
    siteName: 'Task Manager',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Task Dashboard',
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

export default async function DashboardPage() {
  const tasks = await getTasks();
  return <DashboardClient tasks={tasks} />;
}
