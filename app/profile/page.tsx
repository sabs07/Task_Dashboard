"use client";
import { useUser } from "../../src/context/UserContext";
import { useTasks } from "../../src/context/TaskContext";
import { useForm } from "react-hook-form";
import { useState, useMemo, useEffect } from "react";
import Button from "../../src/components/Button";
import LineChart from "../../src/components/LineChart";
import styles from "../Dashboard.module.css";
import Link from "next/link";

const PRIORITIES = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function ProfilePage() {
  const { user, updateUser, loading } = useUser();
  const { tasks } = useTasks();
  const [theme, setTheme] = useState(user?.theme || "light");
  const [notif, setNotif] = useState(false); // Placeholder for notifications
  const { register, handleSubmit, setValue, reset, formState } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      defaultPriority: user?.defaultPriority || "medium",
    },
    mode: 'onTouched',
  });
  const { errors } = formState;

  // Sync form values and theme with user context
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        defaultPriority: user.defaultPriority,
      });
      setTheme(user.theme);
    }
  }, [user, reset]);

  // Apply theme to <body> class
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  // Productivity chart: tasks completed per day (last 30 days)
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const dailyCounts = last30.map((date) =>
    tasks.filter((t) => t.completedAt === date).length
  );

  // Best performing days
  const maxTasks = Math.max(...dailyCounts);
  const bestDays = last30.filter((date, i) => dailyCounts[i] === maxTasks && maxTasks > 0);

  // Average tasks per day
  const avgTasks = (dailyCounts.reduce((a, b) => a + b, 0) / 30).toFixed(2);

  const onSubmit = async (data: any) => {
    await updateUser({ ...data, theme });
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await updateUser({ theme: newTheme });
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
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }} noValidate>
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
          Default Priority
          <select {...register("defaultPriority")} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: "100%" }}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={notif} onChange={() => setNotif((n) => !n)} />
          Enable Notifications (UI only)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Theme:
          <Button type="button" onClick={handleThemeToggle} variant="secondary">
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </Button>
        </label>
        <Button type="submit">Save Changes</Button>
      </form>
      <div style={{ marginTop: 32 }}>
        <h2>Personal Stats</h2>
        <div style={{ maxWidth: 500 }}>
          <h4>Productivity (Last 30 Days)</h4>
          <LineChart tasks={tasks.filter(t => t.completedAt && last30.includes(t.completedAt))} />
        </div>
        <div style={{ marginTop: 16 }}>
          <b>Best Performing Day(s):</b> {bestDays.length > 0 ? bestDays.join(", ") : "-"}
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Avg Tasks per Day:</b> {avgTasks}
        </div>
      </div>
    </div>
  );
} 