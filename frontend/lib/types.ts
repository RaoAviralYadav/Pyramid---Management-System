export type ThemeMode = 'LIGHT' | 'DARK';
export type AccentColor = 'AMBER' | 'BLUE' | 'PINK' | 'ROSE' | 'EMERALD' | 'BLACK';
export type Priority = 'NO_PRIORITY' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'DOING' | 'ON_HOLD' | 'COMPLETED';

export interface User {
  id: string;
  email?: string | null;
  fullName?: string | null;
  title?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  isGuest: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  dueDate?: string | null;
  leadId?: string | null;
  lead?: User | null;
  _count?: { tasks: number };
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  priority: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: User | null;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  message: string;
  user?: User | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  taskType?: string | null;
  team?: string | null;
  labels: string[];
  startDate?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
  project?: Project | null;
  reporterId?: string | null;
  reporter?: User | null;
  assignees: User[];
  subtasks?: Subtask[];
  comments?: Comment[];
  activities?: TaskActivity[];
  _count?: { subtasks: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'DOING', 'ON_HOLD', 'COMPLETED'];
export const PRIORITIES: Priority[] = ['NO_PRIORITY', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
export const ACCENT_COLORS: { value: AccentColor; label: string }[] = [
  { value: 'AMBER', label: 'Amber' },
  { value: 'BLUE', label: 'Blue' },
  { value: 'PINK', label: 'Pink' },
  { value: 'ROSE', label: 'Rose' },
  { value: 'EMERALD', label: 'Emerald' },
  { value: 'BLACK', label: 'Black' },
];
