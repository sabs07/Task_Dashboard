import ProfileClient from '../../src/components/ProfileClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: 'Profile | Task Manager',
  description: 'Manage your user profile, preferences, and view personal productivity stats.',
  openGraph: {
    title: 'Profile | Task Manager',
    description: 'Manage your user profile, preferences, and view personal productivity stats.',
    url: 'https://your-vercel-url.com/profile',
    siteName: 'Task Manager',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Profile',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

async function getUser() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/user`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getTasks() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/tasks`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProfilePage() {
  const [user, tasks] = await Promise.all([getUser(), getTasks()]);
  return <ProfileClient user={user} tasks={tasks} />;
} 