import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import Card from '../../../src/components/Card';

export const metadata: Metadata = {
  title: 'Task Details | Task Manager',
};

async function getTask(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/tasks?id=${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.find((t) => t.id === id) || null;
  }
  return data;
}

export default async function Page({ params }: { params: { id: string } }) {
  const task = await getTask(params.id);
  if (!task) return notFound();
  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <Card>
        <h1 style={{ marginBottom: 16 }}>Task Details</h1>
        <div style={{ marginBottom: 12 }}><b>Title:</b> {task.title}</div>
        <div style={{ marginBottom: 12 }}><b>Priority:</b> {task.priority}</div>
        <div style={{ marginBottom: 12 }}><b>Status:</b> {task.status}</div>
        <div style={{ marginBottom: 12 }}><b>Due Date:</b> {task.dueDate || '-'}</div>
        {task.description && <div style={{ marginBottom: 12 }}><b>Description:</b> {task.description}</div>}
        <Link href="/tasks" style={{ color: '#2563eb', textDecoration: 'underline' }}>&larr; Back to Tasks</Link>
      </Card>
    </div>
  );
} 