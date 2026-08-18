import type { Project, Task, User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pyramid_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string | string[] });
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Request failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function toQueryString(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

export const api = {
  guestLogin: () => request<{ accessToken: string; user: User }>('/auth/guest', { method: 'POST' }),
  me: () => request<User>('/auth/me'),

  users: {
    list: () => request<User[]>('/users'),
  },

  updateProfile: (data: Partial<User>) => request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  updatePreferences: (data: { theme?: string; accentColor?: string }) =>
    request<User>('/users/me/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  leaveWorkspace: () => request<{ left: boolean; deleted: boolean }>('/users/me/leave-workspace', { method: 'POST' }),

  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (data: Partial<Project>) => request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Project>) =>
      request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },

  tasks: {
    list: (params?: { projectId?: string; status?: string; search?: string }) =>
      request<Task[]>(`/tasks${toQueryString(params)}`),
    get: (id: string) => request<Task>(`/tasks/${id}`),
    create: (data: Record<string, unknown>) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
    addSubtask: (id: string, data: Record<string, unknown>) =>
      request(`/tasks/${id}/subtasks`, { method: 'POST', body: JSON.stringify(data) }),
    addComment: (id: string, content: string) =>
      request(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  },

  subtasks: {
    update: (id: string, data: Record<string, unknown>) =>
      request(`/subtasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/subtasks/${id}`, { method: 'DELETE' }),
  },

  comments: {
    react: (id: string, emoji: string) => request(`/comments/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
  },
};