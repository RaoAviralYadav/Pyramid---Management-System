'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, Popover, PopoverItem, PriorityTag } from '@/components/ui/primitives';
import { PRIORITIES, type Priority, type Project } from '@/lib/types';
import { PRIORITY_LABEL, formatDate } from '@/lib/utils';

export function ProjectsTable({ projects, onPriorityChange }: { projects: Project[]; onPriorityChange: (id: string, priority: Priority) => void }) {
  const router = useRouter();
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-fg">No projects yet</p>
        <p className="text-sm text-fg-muted mt-1">Create a project to start organizing tasks.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 text-xs font-medium text-fg-muted bg-bg-secondary">
        <span>Projects</span>
        <span className="w-24">Priority</span>
        <span className="w-16">Lead</span>
        <span className="w-28">Due Date</span>
        <span className="w-8" />
      </div>
      {projects.map((p) => (
        <div
          key={p.id}
          onClick={() => router.push(`/projects/${p.id}`)}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 border-t border-border text-sm hover:bg-hover cursor-pointer transition-colors"
        >
          <div className="min-w-0">
            <p className="text-fg truncate">{p.name}</p>
            {p._count && <p className="text-xs text-fg-muted mt-0.5">{p._count.tasks} tasks</p>}
          </div>

          <div className="relative w-24" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpenMenuFor(openMenuFor === p.id ? null : p.id)} className="rounded-md hover:bg-hover px-1 py-0.5 -mx-1">
              <PriorityTag priority={p.priority} />
            </button>
            <Popover open={openMenuFor === p.id} onClose={() => setOpenMenuFor(null)} anchorClassName="left-0 top-[calc(100%+4px)] w-44">
              {PRIORITIES.map((pr) => (
                <PopoverItem
                  key={pr}
                  onClick={() => {
                    onPriorityChange(p.id, pr);
                    setOpenMenuFor(null);
                  }}
                >
                  <PriorityTag priority={pr} showLabel />
                  {p.priority === pr && <CheckIcon />}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          <div className="w-16">{p.lead ? <Avatar user={p.lead} size={26} /> : <span className="text-fg-muted">—</span>}</div>
          <div className="w-28 text-fg-muted">{formatDate(p.dueDate) ?? '—'}</div>
          <div className="w-8 flex justify-end">
            <button onClick={(e) => e.stopPropagation()} className="h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg">
              <MoreIcon />
            </button>
          </div>
        </div>
      ))}
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
function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
