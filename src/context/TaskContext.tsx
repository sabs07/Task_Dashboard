'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task } from '../types/models';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
  markIncomplete: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshTasks();
    // eslint-disable-next-line
  }, []);

  const refreshTasks = async () => {
    setLoading(true);
    const local = localStorage.getItem('tasks');
    if (local) {
      setTasks(JSON.parse(local));
      setLoading(false);
    } else {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
      localStorage.setItem('tasks', JSON.stringify(data));
      setLoading(false);
    }
  };

  const persist = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('tasks', JSON.stringify(updated));
  };

  const addTask = async (task: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const newTask = await res.json();
    const updated = [newTask, ...tasks];
    persist(updated);
  };

  const updateTask = async (task: Task) => {
    // If status is not being changed to completed, preserve completedAt
    const prev = tasks.find(t => t.id === task.id);
    let updatedTask = { ...task };
    if (prev && prev.status === 'completed' && task.status !== 'completed') {
      updatedTask.completedAt = undefined;
    } else if (prev && prev.status !== 'completed' && task.status === 'completed') {
      // If marking as completed, set completedAt to today (date only)
      updatedTask.completedAt = new Date().toISOString().slice(0, 10);
    } else if (prev && prev.status === 'completed' && task.status === 'completed') {
      updatedTask.completedAt = prev.completedAt;
    }
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
    const result = await res.json();
    const updated = tasks.map(t => (t.id === result.id ? result : t));
    persist(updated);
  };

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const updated = tasks.filter(t => t.id !== id);
    persist(updated);
  };

  const markComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    // Set completedAt to today (date only)
    await updateTask({ ...task, status: 'completed', completedAt: new Date().toISOString().slice(0, 10) });
  };

  const markIncomplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await updateTask({ ...task, status: 'pending', completedAt: undefined });
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, markComplete, markIncomplete, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}; 