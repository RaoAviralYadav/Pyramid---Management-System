import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic gradient per user id, so avatars are consistent without
// needing a real image — mirrors the colorful gradient avatars in the
// screenshots (Dexter's profile picture).
const GRADIENTS = [
  'from-purple-500 via-pink-500 to-orange-400',
  'from-blue-500 via-cyan-400 to-teal-400',
  'from-rose-500 via-red-400 to-amber-400',
  'from-emerald-500 via-teal-400 to-cyan-400',
  'from-indigo-500 via-purple-500 to-pink-500',
];

export function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export const STATUS_LABEL: Record<string, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  DOING: 'Doing',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
};

export const PRIORITY_LABEL: Record<string, string> = {
  NO_PRIORITY: 'No Priority',
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
