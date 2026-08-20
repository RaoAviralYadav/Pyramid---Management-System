'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TaskStatus } from '@/lib/types';
import { Avatar, Button, PriorityTag } from '@/components/ui/primitives';
import { TaskToolbar, type VisibleFields } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskBoard } from '@/components/tasks/task-board';
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu';
import { formatDate } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [visibleFields, setVisibleFields] = useState<VisibleFields>({ priority: true, members: true, dueDate: true, labels: true });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', params.projectId],
    queryFn: () => api.projects.get(params.projectId),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { projectId: params.projectId }],
    queryFn: () => api.tasks.list({ projectId: params.projectId }),
  });

  const createTask = useMutation({
    mutationFn: (vars: { title: string; status: TaskStatus }) => api.tasks.create({ ...vars, projectId: params.projectId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: params.projectId }] }),
  });

  const moveTask = useMutation({
    mutationFn: (vars: { id: string; status: TaskStatus }) => api.tasks.update(vars.id, { status: vars.status }),
    onMutate: async (vars) => {
      const key = ['tasks', { projectId: params.projectId }];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: typeof tasks = []) => old.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tasks', { projectId: params.projectId }], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: params.projectId }] }),
  });

  const filtered = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => statusFilter.length === 0 || statusFilter.includes(t.status));

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link href="/projects" className="text-fg-muted hover:text-fg transition-colors">
            Projects
          </Link>
          <span className="text-fg-muted">/</span>
          <span className="text-fg font-medium truncate">{project?.name ?? '…'}</span>
        </div>

        {project && <ProjectActionsMenu project={project} />}
      </div>

      {projectLoading ? (
        <div className="px-6 pb-6">
          <p className="text-sm text-fg-muted py-10">Loading project…</p>
        </div>
      ) : project ? (
        <>
          <div className="px-6 pb-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">Project</p>
                  <h1 className="mt-1 text-2xl font-semibold text-fg">{project.name}</h1>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoField label="Priority">
                  <PriorityTag priority={project.priority} />
                </InfoField>
                <InfoField label="Team lead">
                  {project.lead ? (
                    <span className="inline-flex items-center gap-2 text-sm text-fg">
                      <Avatar user={project.lead} size={22} />
                      {project.lead.fullName || project.lead.username || 'Lead'}
                    </span>
                  ) : (
                    <span className="text-fg-muted">Unassigned</span>
                  )}
                </InfoField>
                <InfoField label="Due date">
                  <span className="text-sm text-fg-muted">{formatDate(project.dueDate) ?? '—'}</span>
                </InfoField>
                <InfoField label="Tasks">
                  <span className="text-sm text-fg-muted">{project._count?.tasks ?? tasks.length} total</span>
                </InfoField>
              </div>
            </div>
          </div>

          <TaskToolbar
            view={view}
            onViewChange={setView}
            search={search}
            onSearchChange={setSearch}
            visibleFields={visibleFields}
            onFieldsChange={setVisibleFields}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddTask={(title) => createTask.mutate({ title, status: 'TODO' })}
          />

          <div className="flex-1 min-h-0 px-6 pb-6">
            {isLoading ? (
              <p className="py-10 text-sm text-fg-muted">Loading tasks…</p>
            ) : view === 'list' ? (
              <TaskListView
                tasks={filtered}
                visibleFields={visibleFields}
                onAddTask={(status, title) => createTask.mutate({ title, status })}
              />
            ) : (
              <TaskBoard
                tasks={filtered}
                visibleFields={visibleFields}
                onMove={(id, status) => moveTask.mutate({ id, status })}
                onAddTask={(status, title) => createTask.mutate({ title, status })}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-fg-muted">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}