'use client';

import { Avatar, PriorityTag } from '@/components/ui/primitives';
import type { Project, Priority } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ProjectActionsMenu } from './project-actions-menu';

export function ProjectsTable({ projects, onPriorityChange }: { projects: Project[]; onPriorityChange: (id: string, priority: Priority) => void }) {

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-fg">No projects yet</p>
        <p className="text-sm text-fg-muted mt-1">Create a project to start organizing tasks.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-visible">
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
          className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 border-t border-border text-sm hover:bg-hover transition-colors"
        >
          <div className="min-w-0">
            <p className="text-fg truncate">{p.name}</p>
            {p._count && <p className="text-xs text-fg-muted mt-0.5">{p._count.tasks} tasks</p>}
          </div>

          <div className="w-24">
            <PriorityTag priority={p.priority} />
          </div>

          <div className="w-16">{p.lead ? <Avatar user={p.lead} size={26} /> : <span className="text-fg-muted">—</span>}</div>
          <div className="w-28 text-fg-muted">{formatDate(p.dueDate) ?? '—'}</div>
          <div className="w-8 flex justify-end">
            <ProjectActionsMenu project={p} />
          </div>
        </div>
      ))}
    </div>
  );
}
