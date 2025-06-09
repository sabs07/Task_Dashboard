"use client";
import { useState, useMemo, useEffect } from "react";
import { useTasks } from "../../src/context/TaskContext";
import { Task } from "../../src/types/models";
import TaskItem from "../../src/components/TaskItem";
import Button from "../../src/components/Button";
import Modal from "../../src/components/Modal";
import PieChart from "../../src/components/PieChart";
import BarChart from "../../src/components/BarChart";
import LineChart from "../../src/components/LineChart";
import styles from "../Dashboard.module.css";
import { useForm } from "react-hook-form";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
];

const PRIORITY_COLORS = {
  high: "#e53935",
  medium: "#fbc02d",
  low: "#43a047",
};

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

export default function TasksPage() {
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

  const filtered = useMemo(() => {
    let filtered = filterTasks(tasks, filter);
    if (search) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [tasks, filter, search]);

  // Analytics data
  const monthlyCompletion = useMemo(() => {
    const map: { [month: string]: number } = {};
    tasks.forEach((t) => {
      if (t.status === "completed" && t.completedAt) {
        const d = new Date(t.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [tasks]);

  const priorityDist = useMemo(() => {
    const map: { [priority: string]: number } = { high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => map[t.priority]++);
    return Object.entries(map).map(([priority, count]) => ({ priority, count }));
  }, [tasks]);

  const completionRate = useMemo(() => {
    const byMonth: { [month: string]: { completed: number; total: number } } = {};
    tasks.forEach((t) => {
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
  }, [tasks]);

  // Add/Edit Task form
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { title: "", priority: "medium", dueDate: "" },
  });

  // Sync form values when editing
  useEffect(() => {
    if (editTask && showModal) {
      setValue("title", editTask.title);
      setValue("priority", editTask.priority);
      setValue("dueDate", editTask.dueDate ? editTask.dueDate.slice(0, 10) : "");
    } else if (!showModal) {
      reset({ title: "", priority: "medium", dueDate: "" });
    }
  }, [editTask, showModal, setValue, reset]);

  const onSubmit = async (data: any) => {
    if (editTask) {
      // Always preserve status and completedAt when editing
      await updateTask({ ...editTask, ...data, status: editTask.status, completedAt: editTask.completedAt });
      setEditTask(null);
    } else {
      await addTask(data);
    }
    reset();
    setShowModal(false);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
    reset({ title: "", priority: "medium", dueDate: "" });
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
            {filtered.length === 0 ? (
              <div>No tasks found.</div>
            ) : (
              filtered.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => openEdit(task)}
                  onDelete={deleteTask}
                  onComplete={() => markComplete(task.id)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className={styles.chartsSection}>
          <div style={{ maxWidth: 400 }}>
            <h3>Monthly Task Completion</h3>
            <BarChart tasks={tasks} />
          </div>
          <div style={{ maxWidth: 400 }}>
            <h3>Priority-wise Distribution</h3>
            <PieChart tasks={tasks} />
          </div>
          <div style={{ maxWidth: 400 }}>
            <h3>Completion Rate Trends</h3>
            <LineChart tasks={tasks} />
          </div>
        </div>
      )}
      <Modal open={showModal} onClose={closeModal} title={editTask ? "Edit Task" : "Add Task"}>
        {showModal && (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input {...register("title", { required: true })} placeholder="Title" style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <select {...register("priority")}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input type="date" {...register("dueDate")} style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button type="submit">{editTask ? "Update" : "Add"}</Button>
              <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 