"use client";
import Card from '../src/components/Card';
import styles from './Dashboard.module.css';
import { useTasks } from '../src/context/TaskContext';
import { computeTaskStats } from '../src/utils/taskStats';
import { useForm } from 'react-hook-form';
import Button from '../src/components/Button';
import TaskItem from '../src/components/TaskItem';
import Modal from '../src/components/Modal';
import { useState } from 'react';
import { Task } from '../src/types/models';
import LineChart from '../src/components/LineChart';
import PieChart from '../src/components/PieChart';
import BarChart from '../src/components/BarChart';
import Link from 'next/link';

export default function Dashboard() {
  const { tasks, loading, addTask, markComplete, updateTask, deleteTask } = useTasks();
  const stats = computeTaskStats(tasks);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Quick Add Task form
  const { register, handleSubmit, reset, formState, setError, clearErrors } = useForm({ defaultValues: { title: '', priority: 'medium', dueDate: '' } });
  const { errors } = formState;
  const onSubmit = async (data: any) => {
    // Validate due date (if provided)
    if (data.dueDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(data.dueDate);
      if (due < today) {
        setError('dueDate', { type: 'manual', message: 'Due date cannot be in the past.' });
        return;
      }
    }
    await addTask(data);
    reset();
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/tasks">
            <Button variant="secondary">Tasks</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary">Profile</Button>
          </Link>
        </div>
      </div>
      <section className={styles.summarySection}>
        <Card><span className={styles.totalLabel}>Summary: Total Tasks</span><br /><b>{loading ? '...' : stats.total}</b></Card>
        <Card><span className={styles.completedTodayLabel}>Summary: Completed Today</span><br /><b>{loading ? '...' : stats.completedToday}</b></Card>
        <Card><span className={styles.pendingLabel}>Summary: Pending Tasks</span><br /><b>{loading ? '...' : stats.pending}</b></Card>
        <Card><span className={styles.overdueLabel}>Summary: Overdue Tasks</span><br /><b>{loading ? '...' : stats.overdue}</b></Card>
      </section>
      <section className={styles.recentSection}>
        <Card>
          <h2>Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div>No tasks yet. Add your first task!</div>
          ) : (
            tasks.slice(0, 6).map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={markComplete}
                onOverdue={async (id) => {
                  const t = tasks.find(t => t.id === id);
                  if (!t || t.status === 'completed') return;
                  // Set dueDate to yesterday to mark as overdue
                  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                  await updateTask({ ...t, dueDate: yesterday, status: 'pending' });
                }}
                onEdit={(task) => setEditTask(task)}
                onDelete={deleteTask}
              />
            ))
          )}
        </Card>
        <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
          {editTask && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updated = {
                  ...(editTask as Task),
                  title: formData.get('title') as string,
                  priority: formData.get('priority') as Task['priority'],
                  dueDate: formData.get('dueDate') as string,
                };
                console.log('Updating task:', updated);
                await updateTask(updated);
                setEditTask(null);
              }}
              className={styles.quickAddForm}
            >
              <input
                name="title"
                defaultValue={editTask.title}
                placeholder="Task title"
                className={styles.input}
                required
              />
              <select name="priority" defaultValue={editTask.priority} className={styles.input}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                name="dueDate"
                defaultValue={editTask.dueDate || ''}
                className={styles.input}
              />
              <Button type="submit">Save</Button>
            </form>
          )}
        </Modal>
        <Card>
          <h2>Quick Add Task</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.quickAddForm} noValidate>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
              placeholder="Task title"
              className={styles.input}
              disabled={formState.isSubmitting}
              style={errors.title ? { borderColor: '#e53935' } : {}}
            />
            {errors.title && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.title.message}</span>}
            <select {...register('priority')} className={styles.input} disabled={formState.isSubmitting}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              {...register('dueDate')}
              className={styles.input}
              disabled={formState.isSubmitting}
              style={errors.dueDate ? { borderColor: '#e53935' } : {}}
              onChange={e => {
                clearErrors('dueDate');
                register('dueDate').onChange(e);
              }}
            />
            {errors.dueDate && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.dueDate.message}</span>}
            <Button type="submit" loading={formState.isSubmitting}>
              Add Task
            </Button>
          </form>
        </Card>
      </section>
      <section className={styles.chartsSection}>
        <Card><LineChart tasks={tasks} /></Card>
        <Card><PieChart tasks={tasks} /></Card>
        <Card><BarChart tasks={tasks} /></Card>
      </section>
    </div>
  );
}
