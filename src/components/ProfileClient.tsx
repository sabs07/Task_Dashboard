"use client";
import { useUser } from "../context/UserContext";
import { useTasks } from "../context/TaskContext";
import { useForm } from "react-hook-form";
import { useState, useMemo, useEffect } from "react";
import Button from "./Button";
import LineChart from "./LineChart";
import styles from "../../app/Dashboard.module.css";
import Link from "next/link";
import { User, Task } from "../types/models";
import { useTheme } from "../context/ThemeContext";
import Skeleton from './Skeleton';
import toast from 'react-hot-toast';
import Card from './Card';
import ThemeToggle from './ThemeToggle';

interface ProfileClientProps {
  user: User;
  tasks: Task[];
}

export default function ProfileClient({ user: initialUser, tasks: initialTasks }: ProfileClientProps) {
  const { user, updateUser, loading } = useUser();
  const { tasks } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const [notif, setNotif] = useState(false); // Placeholder for notifications
  const { register, handleSubmit, setValue, reset, formState } = useForm({
    defaultValues: {
      name: initialUser?.name || "",
      email: initialUser?.email || "",
      age: initialUser?.age || "",
    },
    mode: 'onTouched',
  });
  const { errors } = formState;

  // Sync form values with user context
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        age: user.age,
      });
    }
  }, [user, reset]);

  // Productivity chart: tasks completed per day (last 30 days)
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const allTasks = tasks.length > 0 ? tasks : initialTasks;
  const dailyCounts = last30.map((date) =>
    allTasks.filter((t) => t.completedAt === date).length
  );

  // Best performing days
  const maxTasks = Math.max(...dailyCounts);
  const bestDays = last30.filter((date, i) => dailyCounts[i] === maxTasks && maxTasks > 0);

  // Average tasks per day
  const avgTasks = (dailyCounts.reduce((a, b) => a + b, 0) / 30).toFixed(2);

  const onSubmit = async (data: any) => {
    try {
      await updateUser({ ...data, theme });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Profile</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/">
            <Button variant="secondary">Dashboard</Button>
          </Link>
          <Link href="/tasks">
            <Button variant="secondary">Tasks</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary">Profile</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }} noValidate>
        {loading ? (
          <>
            <Skeleton width="100%" height={38} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={38} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={38} style={{ marginBottom: 12 }} />
            <Skeleton width={120} height={38} style={{ marginBottom: 12 }} />
            <Skeleton width={160} height={38} style={{ marginBottom: 12 }} />
            <Skeleton width={120} height={38} />
          </>
        ) : (
        <>
        <label>
          Name
          <input {...register("name", { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} style={{ padding: 8, borderRadius: 8, border: errors.name ? '1px solid #e53935' : '1px solid #ccc', width: "100%" }} />
          {errors.name && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.name.message}</span>}
        </label>
        <label>
          Email
          <input {...register("email", { required: 'Email is required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email address' } })} type="email" style={{ padding: 8, borderRadius: 8, border: errors.email ? '1px solid #e53935' : '1px solid #ccc', width: "100%" }} />
          {errors.email && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.email.message}</span>}
        </label>
        <label>
          Age
          <input {...register("age", { required: 'Age is required', min: { value: 1, message: 'Age must be at least 1' }, max: { value: 120, message: 'Age must be at most 120' } })} type="number" style={{ padding: 8, borderRadius: 8, border: errors.age ? '1px solid #e53935' : '1px solid #ccc', width: "100%" }} />
          {errors.age && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.age.message}</span>}
        </label>
        <Button type="submit" loading={formState.isSubmitting}>Save Changes</Button>
        </>
        )}
      </form>
      <Card style={{ marginTop: 32, maxWidth: 600, background: 'var(--stats-card-background, #f5f7fa)' }}>
        <h2>Personal Stats</h2>
        <div style={{ maxWidth: 500 }}>
          <h4>Productivity (Last 30 Days)</h4>
          {loading ? <Skeleton width="100%" height={180} /> : <LineChart tasks={allTasks.filter(t => t.completedAt && last30.includes(t.completedAt))} />}
        </div>
        <div style={{ marginTop: 16 }}>
          <b>Best Performing Day(s):</b> {loading ? <Skeleton width={180} height={18} /> : (bestDays.length > 0 ? bestDays.join(", ") : "-")}
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Avg Tasks per Day:</b> {loading ? <Skeleton width={80} height={18} /> : avgTasks}
        </div>
      </Card>
    </div>
  );
} 