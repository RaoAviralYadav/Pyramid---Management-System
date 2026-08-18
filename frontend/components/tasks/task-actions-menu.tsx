'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ConfirmDialog, Divider, Popover, PopoverItem, StatusDot } from '@/components/ui/primitives';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/utils';

export function TaskActionsMenu({ task, className }: { task: Task; className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const move = useMutation({
    mutationFn: (status: TaskStatus) => api.tasks.update(task.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const remove = useMutation({
    mutationFn: () => api.tasks.remove(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setConfirmOpen(false);
    },
  });

  return (
    <div className={`relative ${className ?? ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg transition-colors"
        aria-label="Task options"
      >
        <MoreIcon />
      </button>

      <Popover open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-[calc(100%+4px)] w-48">
        <PopoverItem
          onClick={() => {
            setOpen(false);
            router.push(`/tasks/${task.id}`);
          }}
        >
          <OpenIcon /> Open task
        </PopoverItem>

        <Divider />
        <p className="px-3 pb-1 text-xs font-medium text-fg-muted">Move to</p>
        {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
          <PopoverItem
            key={s}
            onClick={() => {
              move.mutate(s);
              setOpen(false);
            }}
          >
            <StatusDot status={s} /> {STATUS_LABEL[s]}
          </PopoverItem>
        ))}

        <Divider />
        <PopoverItem
          onClick={() => {
            setOpen(false);
            setConfirmOpen(true);
          }}
        >
          <TrashIcon />
          <span className="text-red-500">Delete task</span>
        </PopoverItem>
      </Popover>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this task?"
        description={`"${task.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
      />
    </div>
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
function OpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
    </svg>
  );
}