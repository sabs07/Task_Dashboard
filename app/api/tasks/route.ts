import { NextRequest, NextResponse } from 'next/server';
import { Task } from '../../../src/types/models';

let tasks: Task[] = [];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newTask: Task = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'pending' };
  tasks.unshift(newTask);
  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const idx = tasks.findIndex(t => t.id === data.id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...data };
    return NextResponse.json(tasks[idx]);
  }
  return NextResponse.json({ error: 'Task not found' }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  tasks = tasks.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
} 