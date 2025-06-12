"use client";
import Card from './Card';
import styles from '../../app/Dashboard.module.css';
import { useTasks } from '../context/TaskContext';
import { computeTaskStats } from '../utils/taskStats';
import { useForm } from 'react-hook-form';
import Button from './Button';
import TaskItem from './TaskItem';
import Modal from './Modal';
import { useState, useEffect } from 'react';
import { Task } from '../types/models';
import LineChart from './LineChart';
import PieChart from './PieChart';
import BarChart from './BarChart';
import Link from 'next/link';
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from './ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';
import Skeleton from './Skeleton';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

interface DashboardClientProps {
  tasks: Task[];
}

export default function DashboardClient({ tasks: initialTasks }: DashboardClientProps) {
  const { tasks, loading, addTask, markComplete, updateTask, deleteTask, refreshTasks } = useTasks();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useUser();

  // Hydrate local context with initial tasks if empty
  useEffect(() => {
    if (!loading && tasks.length === 0 && initialTasks.length > 0) {
      // Optionally, you could implement a context method to hydrate from SSR
      // For now, just show initialTasks until context loads
      setHydrated(true);
    } else {
      setHydrated(false);
    }
  }, [loading, tasks, initialTasks]);

  const displayTasks = hydrated ? initialTasks : tasks;
  const stats = computeTaskStats(displayTasks);

  // Quick Add Task form
  const todayStr = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, reset, formState, setError, clearErrors } = useForm({ defaultValues: { title: '', priority: '', dueDate: todayStr } });
  const { errors } = formState;
  const onSubmit = async (data: any) => {
    // Validate due date (required and not in the past)
    if (!data.dueDate) {
      setError('dueDate', { type: 'manual', message: 'Due date is required.' });
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(data.dueDate);
    if (due < today) {
      setError('dueDate', { type: 'manual', message: 'Due date cannot be in the past.' });
      return;
    }
    try {
      await addTask(data);
      toast.success('Task added!');
      reset({ title: '', priority: '', dueDate: todayStr });
    } catch (err) {
      toast.error('Failed to add task.');
    }
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
          <ThemeToggle />
        </div>
      </div>
      <section className={styles.summarySection}>
        <Card><span className={styles.totalLabel}>Summary: Total Tasks</span><br />{loading ? <Skeleton width={60} height={28} /> : <b>{stats.total}</b>}</Card>
        <Card><span className={styles.completedTodayLabel}>Summary: Completed Today</span><br />{loading ? <Skeleton width={60} height={28} /> : <b>{stats.completedToday}</b>}</Card>
        <Card><span className={styles.pendingLabel}>Summary: Pending Tasks</span><br />{loading ? <Skeleton width={60} height={28} /> : <b>{stats.pending}</b>}</Card>
        <Card><span className={styles.overdueLabel}>Summary: Overdue Tasks</span><br />{loading ? <Skeleton width={60} height={28} /> : <b>{stats.overdue}</b>}</Card>
      </section>
      <section className={styles.recentSection}>
        <Card>
          <h2>Recent Tasks</h2>
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Skeleton width={120} height={18} />
                  <Skeleton width={60} height={18} />
                  <Skeleton width={60} height={18} />
                </div>
              ))}
            </>
          ) : displayTasks.length === 0 ? (
            <div>No tasks yet. Add your first task!</div>
          ) : (
            <AnimatePresence initial={false}>
              {displayTasks.slice(0, 6).map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <TaskItem
                    task={task}
                    onComplete={markComplete}
                    onOverdue={async (id) => {
                      const t = displayTasks.find(t => t.id === id);
                      if (!t || t.status === 'completed') return;
                      // Set dueDate to yesterday to mark as overdue
                      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                      await updateTask({ ...t, dueDate: yesterday, status: 'pending' });
                    }}
                    onEdit={(task) => setEditTask(task)}
                    onDelete={async (id) => {
                      try {
                        await deleteTask(id);
                        toast.success('Task deleted!');
                      } catch (err) {
                        toast.error('Failed to delete task.');
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
                try {
                  await updateTask(updated);
                  toast.success('Task updated!');
                  setEditTask(null);
                } catch (err) {
                  toast.error('Failed to update task.');
                }
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
              <Button type="submit" loading={formState.isSubmitting}>Save</Button>
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
            <select {...register('priority', { required: 'Priority is required' })} className={styles.input} disabled={formState.isSubmitting} defaultValue="">
              <option value="" disabled>Priority Select</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {errors.priority && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.priority.message}</span>}
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required.' })}
              className={styles.input}
              disabled={formState.isSubmitting}
              min={todayStr}
              defaultValue={todayStr}
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
        <Card>{loading ? <Skeleton width="100%" height={180} /> : <LineChart tasks={displayTasks} />}</Card>
        <Card>{loading ? <Skeleton width="100%" height={180} /> : <PieChart tasks={displayTasks} />}</Card>
        <Card>{loading ? <Skeleton width="100%" height={180} /> : <BarChart tasks={displayTasks} />}</Card>
      </section>
    </div>
  );
} 