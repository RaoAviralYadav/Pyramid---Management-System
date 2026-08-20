'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, Popover, PopoverItem } from '@/components/ui/primitives';
import type { Task } from '@/lib/types';

// Wraps a trigger (an avatar stack, a "+" button, whatever the call site
// needs) with a popover listing every user, checkmarking current
// assignees. Handles its own mutation + cache invalidation so call sites
// don't need to wire callbacks through — this is the same reason
// TaskActionsMenu below is self-contained.
export function MembersPicker({ task, trigger }: { task: Task; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => api.users.list(), enabled: open });

  async function toggle(userId: string) {
    const active = task.assignees.some((a) => a.id === userId);
    const next = active ? task.assignees.filter((a) => a.id !== userId).map((a) => a.id) : [...task.assignees.map((a) => a.id), userId];
    await api.tasks.update(task.id, { assigneeIds: next });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task', task.id] });
  }

  return (
    <div
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-[calc(100%+4px)] w-52">
        <p className="px-3 pb-1 text-xs font-medium text-fg-muted">Members</p>
        {users.length === 0 && <p className="px-3 py-1.5 text-xs text-fg-muted">Loading…</p>}
        {users.map((u) => {
          const active = task.assignees.some((a) => a.id === u.id);
          return (
            <PopoverItem key={u.id} onClick={() => toggle(u.id)}>
              <Avatar user={u} size={20} />
              <span className="flex-1 truncate">{u.fullName || u.username}</span>
              {active && <CheckIcon />}
            </PopoverItem>
          );
        })}
      </Popover>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-accent ml-auto shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}