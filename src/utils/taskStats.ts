import { Task, TaskStats } from '../types/models';

export function computeTaskStats(tasks: Task[]): TaskStats {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  let completedToday = 0;
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed++;
      if (task.completedAt && task.completedAt.slice(0, 10) === todayStr) {
        completedToday++;
      }
    } else if (task.status === 'pending') {
      pending++;
      if (task.dueDate && task.dueDate.slice(0, 10) < todayStr) {
        overdue++;
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    completedToday,
  };
} 