'use client';

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, initials, avatarGradient, PRIORITY_LABEL } from '@/lib/utils';
import type { Priority, User } from '@/lib/types';

/* ---------------------------------- Avatar --------------------------------- */

export function Avatar({
  user,
  size = 28,
  className,
  style,
}: {
  user?: Pick<User, 'fullName' | 'username' | 'avatarUrl'> | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const name = user?.fullName || user?.username || '?';
  if (user?.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={user.avatarUrl}
        alt={name}
        width={size}
        height={size}
        className={cn('rounded-full object-cover shrink-0', className)}
        style={{ width: size, height: size, ...style }}
      />
    );
  }
  return (
    <div
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br',
        avatarGradient(name),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.38), ...style }}
    >
      {initials(name)}
    </div>
  );
}

const ringStyle = { '--tw-ring-color': 'var(--card)' } as React.CSSProperties;

export function AvatarStack({ users, max = 3 }: { users: User[]; max?: number }) {
  if (!users.length) {
    return <span className="text-fg-muted text-sm">—</span>;
  }
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} size={26} className="ring-2" style={ringStyle} />
      ))}
      {overflow > 0 && (
        <div className="h-[26px] w-[26px] rounded-full bg-hover text-fg-muted text-xs flex items-center justify-center ring-2" style={ringStyle}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Button ---------------------------------- */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm',
        variant === 'primary' && 'bg-fg text-bg hover:opacity-85',
        variant === 'secondary' && 'bg-card border border-border text-fg hover:bg-hover',
        variant === 'ghost' && 'text-fg-muted hover:bg-hover hover:text-fg',
        variant === 'danger' && 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------- Priority tag ------------------------------- */

const PRIORITY_COLOR: Record<Priority, string> = {
  NO_PRIORITY: 'var(--fg-muted)',
  URGENT: '#ef4444',
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#71717a',
};

const PRIORITY_BARS: Record<Priority, number> = {
  NO_PRIORITY: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 3,
};

export function PriorityIcon({ priority, size = 14 }: { priority: Priority; size?: number }) {
  const active = PRIORITY_BARS[priority];
  const color = PRIORITY_COLOR[priority];
  const heights = [0.45, 0.7, 1];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="shrink-0">
      {heights.map((h, i) => {
        const barW = 3;
        const gap = 1.5;
        const x = i * (barW + gap);
        const barH = 12 * h;
        return (
          <rect
            key={i}
            x={x}
            y={12 - barH}
            width={barW}
            height={barH}
            rx={0.75}
            fill={i < active ? color : 'var(--border)'}
          />
        );
      })}
    </svg>
  );
}

export function PriorityTag({ priority, showLabel = true }: { priority: Priority; showLabel?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] font-medium"
      style={{ color: priority === 'NO_PRIORITY' ? 'var(--fg-muted)' : PRIORITY_COLOR[priority] }}
    >
      <PriorityIcon priority={priority} />
      {showLabel && PRIORITY_LABEL[priority]}
    </span>
  );
}

/* --------------------------------- Label pill -------------------------------- */

export function LabelPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-fg-muted">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2.7 12.71A2 2 0 0 1 2.1 11.3L2.98 4.36A2 2 0 0 1 4.75 2.6l6.94-.87a2 2 0 0 1 1.72.57l7.18 7.18a2 2 0 0 1 0 2.83Z" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      {label}
    </span>
  );
}

/* --------------------------------- Status dot -------------------------------- */

const STATUS_DOT: Record<string, string> = {
  BACKLOG: '#f59e0b',
  TODO: '#a1a1aa',
  DOING: '#9333ea',
  ON_HOLD: '#ef4444',
  COMPLETED: '#059669',
};

export function StatusDot({ status }: { status: string }) {
  return <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: STATUS_DOT[status] ?? '#a1a1aa' }} />;
}

/* ---------------------------------- Popover ---------------------------------- */

export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export function Popover({
  open,
  onClose,
  anchorClassName,
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorClassName?: string;
  children: ReactNode;
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 rounded-xl border border-border bg-card shadow-popover py-1.5 animate-in',
        anchorClassName,
      )}
    >
      {children}
    </div>
  );
}

export function PopoverItem({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm hover:bg-hover transition-colors',
        active ? 'text-fg' : 'text-fg',
      )}
    >
      {children}
    </button>
  );
}

export function Divider() {
  return <div className="my-1.5 h-px bg-border" />;
}

/* ----------------------------------- Modal ----------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-popover max-h-[90vh] overflow-y-auto', className)}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
            <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm cursor-pointer hover:bg-hover">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-accent h-3.5 w-3.5" />
    </label>
  );
}

/* -------------------------------- Inline add -------------------------------- */

// Shared behavior behind every "+ Add X" row that used to be a browser
// prompt() — toggles between a trigger and an autofocused input, Enter
// submits, Escape cancels, and blurring with unsaved text submits it rather
// than silently discarding it. Kept as a hook (not a wrapping component)
// because the three places that use it — board columns, list-view groups,
// the subtasks table — each need different surrounding markup, but the
// state logic itself is identical.
export function useInlineAdd(onSubmit: (value: string) => void) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  function start() {
    setEditing(true);
  }
  function cancel() {
    setValue('');
    setEditing(false);
  }
  function submit() {
    const trimmed = value.trim();
    setValue('');
    setEditing(false);
    if (trimmed) onSubmit(trimmed);
  }

  const inputProps = {
    autoFocus: true,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') cancel();
    },
    onBlur: () => (value.trim() ? submit() : cancel()),
  };

  return { editing, start, cancel, submit, inputProps };
}

/* -------------------------------- Confirm dialog ------------------------------ */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      {description && <p className="text-sm text-fg-muted">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}