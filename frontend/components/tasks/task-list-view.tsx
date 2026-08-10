'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AvatarStack, LabelPill, PriorityTag } from '@/components/ui/primitives';
import type { Task, TaskStatus } from '@/lib/types';
import { STATUS_LABEL, formatShortDate, isOverdue } from '@/lib/utils';
import type { VisibleFields } from './task-toolbar';

const ORDER: TaskStatus[] = ['BACKLOG', 'TODO', 'DOING', 'ON_HOLD', 'COMPLETED'];

export function TaskListView({
  tasks,
  visibleFields,
  onAddTask,
}: {
  tasks: Task[];
  visibleFields: VisibleFields;
  onAddTask: (status: TaskStatus) => void;
}) {
  const groups = ORDER.map((status) => ({ status, tasks: tasks.filter((t) => t.status === status) })).filter(
    (g) => g.tasks.length > 0,
  );

  if (groups.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {groups.map((g) => (
        <StatusGroup key={g.status} status={g.status} tasks={g.tasks} visibleFields={visibleFields} onAddTask={onAddTask} />
      ))}
    </div>
  );
}

function StatusGroup({
  status,
  tasks,
  visibleFields,
  onAddTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  visibleFields: VisibleFields;
  onAddTask: (status: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-fg">
        <ChevronIcon open={open} />
        {STATUS_LABEL[status]}
        <span className="text-fg-muted font-normal">{tasks.length}</span>
      </button>

      {open && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 text-xs font-medium text-fg-muted bg-bg-secondary">
            <span>Task</span>
            {visibleFields.priority && <span className="w-20">Priority</span>}
            {visibleFields.members && <span className="w-20">Members</span>}
            {visibleFields.dueDate && <span className="w-24">Due Date</span>}
            <span className="w-8" />
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2.5 border-t border-border text-sm hover:bg-hover cursor-pointer transition-colors"
            >
              <div className="min-w-0">
                <p className="text-fg truncate">{task.title}</p>
                {visibleFields.labels && task.labels.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {task.labels.slice(0, 3).map((l) => (
                      <LabelPill key={l} label={l} />
                    ))}
                  </div>
                )}
              </div>
              {visibleFields.priority && (
                <div className="w-20">
                  <PriorityTag priority={task.priority} />
                </div>
              )}
              {visibleFields.members && (
                <div className="w-20">
                  <AvatarStack users={task.assignees} max={2} />
                </div>
              )}
              {visibleFields.dueDate && (
                <div className={`w-24 text-sm ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-500' : 'text-fg-muted'}`}>
                  {formatShortDate(task.dueDate) ?? '—'}
                </div>
              )}
              <div className="w-8 flex justify-end">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg"
                >
                  <MoreIcon />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => onAddTask(status)}
            className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-border text-sm text-fg-muted hover:bg-hover hover:text-fg transition-colors"
          >
            <PlusIcon /> Add Task
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium text-fg">No tasks yet</p>
      <p className="text-sm text-fg-muted mt-1">Add a task to get started.</p>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform text-fg-muted ${open ? 'rotate-0' : '-rotate-90'}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
