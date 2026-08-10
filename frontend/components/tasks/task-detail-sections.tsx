'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, AvatarStack, Popover, PopoverItem, PriorityIcon, PriorityTag, StatusDot, useClickOutside } from '@/components/ui/primitives';
import type { Task } from '@/lib/types';
import { PRIORITIES, TASK_STATUSES } from '@/lib/types';
import { PRIORITY_LABEL, STATUS_LABEL, cn, formatDate } from '@/lib/utils';

/* ---------------------------------- Details ---------------------------------- */

export function DetailsPanel({ task, onUpdate }: { task: Task; onUpdate: (data: Record<string, unknown>) => void }) {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => api.users.list() });
  const [open, setOpen] = useState<'status' | 'priority' | 'members' | 'dates' | null>(null);
  const [team, setTeam] = useState(task.team ?? '');

  return (
    <div className="p-4">
      <p className="text-sm font-medium text-fg mb-1 px-1">Details</p>

      <FieldRow label="Status">
        <div className="relative">
          <TriggerButton onClick={() => setOpen(open === 'status' ? null : 'status')}>
            <StatusDot status={task.status} />
            {STATUS_LABEL[task.status]}
          </TriggerButton>
          <Popover open={open === 'status'} onClose={() => setOpen(null)} anchorClassName="left-0 top-[calc(100%+4px)] w-40">
            {TASK_STATUSES.map((s) => (
              <PopoverItem key={s} onClick={() => { onUpdate({ status: s }); setOpen(null); }}>
                <StatusDot status={s} /> {STATUS_LABEL[s]}
              </PopoverItem>
            ))}
          </Popover>
        </div>
      </FieldRow>

      <FieldRow label="Priority">
        <div className="relative">
          <TriggerButton onClick={() => setOpen(open === 'priority' ? null : 'priority')}>
            <PriorityTag priority={task.priority} />
          </TriggerButton>
          <Popover open={open === 'priority'} onClose={() => setOpen(null)} anchorClassName="left-0 top-[calc(100%+4px)] w-44">
            {PRIORITIES.map((p) => (
              <PopoverItem key={p} onClick={() => { onUpdate({ priority: p }); setOpen(null); }}>
                <PriorityIcon priority={p} /> {PRIORITY_LABEL[p]}
                {task.priority === p && <CheckIcon />}
              </PopoverItem>
            ))}
          </Popover>
        </div>
      </FieldRow>

      <FieldRow label="Members">
        <div className="relative">
          <TriggerButton onClick={() => setOpen(open === 'members' ? null : 'members')}>
            {task.assignees.length ? <AvatarStack users={task.assignees} max={3} /> : <span className="text-fg-muted">Add members</span>}
          </TriggerButton>
          <Popover open={open === 'members'} onClose={() => setOpen(null)} anchorClassName="left-0 top-[calc(100%+4px)] w-52">
            {users.map((u) => {
              const active = task.assignees.some((a) => a.id === u.id);
              return (
                <PopoverItem
                  key={u.id}
                  onClick={() => {
                    const next = active ? task.assignees.filter((a) => a.id !== u.id).map((a) => a.id) : [...task.assignees.map((a) => a.id), u.id];
                    onUpdate({ assigneeIds: next });
                  }}
                >
                  <Avatar user={u} size={20} />
                  <span className="flex-1 truncate">{u.fullName || u.username}</span>
                  {active && <CheckIcon />}
                </PopoverItem>
              );
            })}
          </Popover>
        </div>
      </FieldRow>

      <FieldRow label="Dates">
        <div className="relative">
          <TriggerButton onClick={() => setOpen(open === 'dates' ? null : 'dates')}>
            <CalendarIcon />
            {task.startDate ? formatDate(task.startDate) : 'Start'} → {task.dueDate ? formatDate(task.dueDate) : 'End'}
          </TriggerButton>
          {open === 'dates' && (
            <DatesPopover
              startDate={task.startDate}
              dueDate={task.dueDate}
              onChange={(data) => onUpdate(data)}
              onClose={() => setOpen(null)}
            />
          )}
        </div>
      </FieldRow>

      <FieldRow label="Team">
        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          onBlur={() => team !== (task.team ?? '') && onUpdate({ team })}
          placeholder="Add team"
          className="w-full h-7 rounded-md bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:bg-hover px-1.5"
        />
      </FieldRow>

      <FieldRow label="Reporter">
        {task.reporter ? (
          <span className="flex items-center gap-2 px-1.5">
            <Avatar user={task.reporter} size={20} />
            {task.reporter.fullName || task.reporter.username}
          </span>
        ) : (
          <span className="text-fg-muted px-1.5">—</span>
        )}
      </FieldRow>

      <div className="mt-6">
        <p className="text-sm font-medium text-fg mb-2 px-1">Updates</p>
        <div className="flex flex-col gap-3">
          {(task.activities ?? []).length === 0 && <p className="text-xs text-fg-muted px-1">No activity yet.</p>}
          {(task.activities ?? []).map((a) => (
            <div key={a.id} className="flex items-start gap-2 px-1">
              <Avatar user={a.user} size={22} />
              <p className="text-xs text-fg-muted leading-relaxed">
                <span className="text-fg font-medium">{a.user?.fullName || a.user?.username || 'Someone'}</span> {a.message} ·{' '}
                {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-20 shrink-0 text-sm text-fg-muted px-1">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function TriggerButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-1.5 rounded-md px-1.5 h-7 text-sm text-fg hover:bg-hover transition-colors text-left">
      {children}
    </button>
  );
}

function DatesPopover({
  startDate,
  dueDate,
  onChange,
  onClose,
}: {
  startDate?: string | null;
  dueDate?: string | null;
  onChange: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose);
  const [picking, setPicking] = useState<'start' | 'due'>('due');
  const [viewDate, setViewDate] = useState(() => new Date((picking === 'start' ? startDate : dueDate) || Date.now()));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const startD = startDate ? new Date(startDate) : null;
  const dueD = dueDate ? new Date(dueDate) : null;

  function isSelected(d: number) {
    const check = (dt: Date | null) => dt && dt.getDate() === d && dt.getMonth() === month && dt.getFullYear() === year;
    return check(picking === 'start' ? startD : dueD);
  }

  function selectDay(d: number) {
    const iso = new Date(year, month, d).toISOString();
    onChange(picking === 'start' ? { startDate: iso } : { dueDate: iso });
  }

  return (
    <div ref={ref} className="absolute left-0 top-[calc(100%+4px)] z-50 w-64 rounded-xl border border-border bg-card shadow-popover p-3">
      <div className="flex rounded-lg bg-hover p-0.5 mb-3">
        <button onClick={() => setPicking('start')} className={cn('flex-1 h-7 rounded-md text-xs font-medium', picking === 'start' ? 'bg-card shadow-sm text-fg' : 'text-fg-muted')}>
          Start
        </button>
        <button onClick={() => setPicking('due')} className={cn('flex-1 h-7 rounded-md text-xs font-medium', picking === 'due' ? 'bg-card shadow-sm text-fg' : 'text-fg-muted')}>
          End
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="h-6 w-6 flex items-center justify-center rounded hover:bg-hover text-fg-muted">
          ‹
        </button>
        <span className="text-sm font-medium text-fg">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="h-6 w-6 flex items-center justify-center rounded hover:bg-hover text-fg-muted">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[11px] text-fg-muted">
            {d}
          </span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => selectDay(d)}
              className={cn(
                'h-7 w-7 mx-auto rounded-full text-xs transition-colors',
                isSelected(d) ? 'bg-accent text-accent-foreground font-medium' : 'text-fg hover:bg-hover',
              )}
            >
              {d}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Subtasks --------------------------------- */

export function SubtasksTable({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const addSubtask = useMutation({
    mutationFn: (title: string) => api.tasks.addSubtask(task.id, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', task.id] }),
  });

  const subtasks = task.subtasks ?? [];

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-fg-muted bg-bg-secondary">
        <span>Task</span>
        <span className="w-20">Priority</span>
        <span className="w-16">Members</span>
        <span className="w-20">Due Date</span>
      </div>
      {subtasks.map((s) => (
        <div key={s.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-2 border-t border-border text-sm">
          <span className="text-fg truncate">{s.title}</span>
          <div className="w-20">
            <PriorityTag priority={s.priority} />
          </div>
          <div className="w-16">{s.assignee ? <Avatar user={s.assignee} size={22} /> : <span className="text-fg-muted">—</span>}</div>
          <span className="w-20 text-fg-muted">{formatDate(s.dueDate) ?? '—'}</span>
        </div>
      ))}
      <button
        onClick={() => {
          const title = prompt('Subtask title');
          if (title?.trim()) addSubtask.mutate(title.trim());
        }}
        className="w-full flex items-center gap-2 px-4 py-2 border-t border-border text-sm text-fg-muted hover:bg-hover hover:text-fg transition-colors"
      >
        + Add Subtasks
      </button>
    </div>
  );
}

/* --------------------------------- Comments --------------------------------- */

export function CommentsThread({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const addComment = useMutation({
    mutationFn: (content: string) => api.tasks.addComment(task.id, content),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {(task.comments ?? []).map((c) => (
        <div key={c.id} className="flex items-start gap-2.5">
          <Avatar user={c.author} size={28} />
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-fg">{c.author.fullName || c.author.username}</span>{' '}
              <span className="text-xs text-fg-muted">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </p>
            <p className="text-sm text-fg-muted mt-0.5">{c.content}</p>
          </div>
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) addComment.mutate(draft.trim());
        }}
        className="flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 h-9 rounded-lg border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button type="submit" className="h-9 w-9 flex items-center justify-center rounded-lg text-fg-muted hover:bg-hover hover:text-fg">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-fg-muted shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-accent ml-auto shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
