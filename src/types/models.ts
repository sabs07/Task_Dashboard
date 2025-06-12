export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  theme: 'light' | 'dark';
  age: number;
  defaultPriority: 'high' | 'medium' | 'low';
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completedToday: number;
}

export interface ChartData {
  weeklyProgress: { date: string; completed: number; created: number; }[];
  priorityDistribution: { priority: string; count: number; color: string; }[];
  dailyCompletion: { day: string; completed: number; }[];
} 