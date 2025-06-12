"use client";
import { useState, useMemo, useEffect } from "react";
import { useTasks } from "../context/TaskContext";
import { Task } from "../types/models";
import TaskItem from "./TaskItem";
import Button from "./Button";
import Modal from "./Modal";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import styles from "../../app/Dashboard.module.css";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { AnimatePresence, motion } from 'framer-motion';
import Skeleton from './Skeleton';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
];

interface TasksClientProps {
  tasks: Task[];
}

function filterTasks(tasks: Task[], filter: string) {
  const now = new Date();
  switch (filter) {
    case "pending":
      return tasks.filter((t) => t.status === "pending");
    case "completed":
      return tasks.filter((t) => t.status === "completed");
    case "overdue":
      return tasks.filter(
        (t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) < now
      );
    default:
      return tasks;
  }
}

export default function TasksClient({ tasks: initialTasks }: TasksClientProps) {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    markComplete,
    markIncomplete,
    loading,
  } = useTasks();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [tab, setTab] = useState("tasks");
  const [hydrated, setHydrated] = useState(false);
  const { user } = useUser();

  // Hydrate local context with initial tasks if empty
  useEffect(() => {
    if (!loading && tasks.length === 0 && initialTasks.length > 0) {
      setHydrated(true);
    } else {
      setHydrated(false);
    }
  }, [loading, tasks, initialTasks]);

  const displayTasks = hydrated ? initialTasks : tasks;

  const filtered = useMemo(() => {
    let filtered = filterTasks(displayTasks, filter);
    if (search) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [displayTasks, filter, search]);

  // Analytics data
  const monthlyCompletion = useMemo(() => {
    const map: { [month: string]: number } = {};
    displayTasks.forEach((t) => {
      if (t.status === "completed" && t.completedAt) {
        const d = new Date(t.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [displayTasks]);

  const priorityDist = useMemo(() => {
    const map: { [priority: string]: number } = { high: 0, medium: 0, low: 0 };
    displayTasks.forEach((t) => map[t.priority]++);
    return Object.entries(map).map(([priority, count]) => ({ priority, count }));
  }, [displayTasks]);

  const completionRate = useMemo(() => {
    const byMonth: { [month: string]: { completed: number; total: number } } = {};
    displayTasks.forEach((t) => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        byMonth[key] = byMonth[key] || { completed: 0, total: 0 };
        byMonth[key].total++;
        if (t.status === "completed") byMonth[key].completed++;
      }
    });
    return Object.entries(byMonth).map(([month, { completed, total }]) => ({
      month,
      rate: total ? Math.round((completed / total) * 100) : 0,
    }));
  }, [displayTasks]);

  // Add/Edit Task form
  const todayStr = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, reset, setValue, formState, setError, clearErrors } = useForm({
    defaultValues: { title: '', priority: '', dueDate: todayStr },
  });
  const { errors } = formState;

  // Sync form values when editing
  useEffect(() => {
    if (editTask && showModal) {
      setValue('title', editTask.title);
      setValue('priority', editTask.priority);
      setValue('dueDate', editTask.dueDate ? editTask.dueDate.slice(0, 10) : '');
    } else if (!showModal) {
      reset({ title: '', priority: '', dueDate: todayStr });
    }
  }, [editTask, showModal, setValue, reset]);

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
      if (editTask) {
        await updateTask({ ...editTask, ...data, status: editTask.status, completedAt: editTask.completedAt });
        setEditTask(null);
        toast.success('Task updated!');
      } else {
        await addTask(data);
        toast.success('Task added!');
      }
      reset({ title: '', priority: '', dueDate: todayStr });
      setShowModal(false);
    } catch (err) {
      toast.error('Something went wrong.');
    }
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
    reset({ title: '', priority: '', dueDate: todayStr });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted!');
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Tasks</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => setShowModal(true)}>Add Task</Button>
          <Link href="/">
            <Button variant="secondary">Dashboard</Button>
          </Link>
          <Link href="/profile">
            <Button variant="secondary">Profile</Button>
          </Link>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Button
          variant={tab === "tasks" ? "primary" : "secondary"}
          onClick={() => setTab("tasks")}
        >
          Task List
        </Button>
        <Button
          variant={tab === "analytics" ? "primary" : "secondary"}
          onClick={() => setTab("analytics")}
          style={{ marginLeft: 8 }}
        >
          Analytics
        </Button>
      </div>
      {tab === "tasks" ? (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "primary" : "secondary"}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginLeft: 16, flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </div>
          <div>
            <AnimatePresence initial={false}>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Skeleton width={120} height={18} />
                    <Skeleton width={60} height={18} />
                    <Skeleton width={60} height={18} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div>No tasks found.</div>
              ) : (
                filtered.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.22 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                    style={{ borderRadius: 12, marginBottom: 8 }}
                  >
                    <TaskItem
                      task={task}
                      onEdit={() => openEdit(task)}
                      onDelete={handleDelete}
                      onComplete={() => markComplete(task.id)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className={styles.chartsSection}>
          <div style={{ maxWidth: 400 }}>
            <h3>Monthly Task Completion</h3>
            {loading ? <Skeleton width="100%" height={180} /> : <BarChart tasks={displayTasks} />}
          </div>
          <div style={{ maxWidth: 400 }}>
            <h3>Priority-wise Distribution</h3>
            {loading ? <Skeleton width="100%" height={180} /> : <PieChart tasks={displayTasks} />}
          </div>
          <div style={{ maxWidth: 400 }}>
            <h3>Completion Rate Trends</h3>
            {loading ? <Skeleton width="100%" height={180} /> : <LineChart tasks={displayTasks} />}
          </div>
        </div>
      )}
      <Modal open={showModal} onClose={closeModal} title={editTask ? "Edit Task" : "Add Task"}>
        {showModal && (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input {...register("title", { required: true })} placeholder="Title" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <select {...register('priority', { required: 'Priority is required' })}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
              defaultValue=""
            >
              <option value="" disabled>Priority Select</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {errors.priority && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.priority.message}</span>}
            <input type="date" {...register("dueDate", { required: 'Due date is required.' })}
              style={{ padding: 8, borderRadius: 8, border: errors.dueDate ? '1px solid #e53935' : '1px solid #ccc' }}
              min={todayStr}
              defaultValue={todayStr}
              onChange={e => {
                clearErrors('dueDate');
                register('dueDate').onChange(e);
              }}
            />
            {errors.dueDate && <span style={{ color: '#e53935', fontSize: 13 }}>{errors.dueDate.message}</span>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button type="submit" loading={formState.isSubmitting}>{editTask ? "Update" : "Add"}</Button>
              <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 