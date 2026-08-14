'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TaskStatus } from '@/lib/types';
import { TaskToolbar, type VisibleFields } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskBoard } from '@/components/tasks/task-board';

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [visibleFields, setVisibleFields] = useState<VisibleFields>({ priority: true, members: true, dueDate: true, labels: true });

  const { data: project } = useQuery({ queryKey: ['project', params.projectId], queryFn: () => api.projects.get(params.projectId) });
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
      <div className="px-6 pt-6 pb-3 flex items-center gap-1.5 text-sm">
        <Link href="/projects" className="text-fg-muted hover:text-fg transition-colors">
          Projects
        </Link>
        <span className="text-fg-muted">/</span>
        <span className="text-fg font-medium">{project?.name ?? '…'}</span>
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

      <div className="flex-1 min-h-0 px-6">
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
    </div>
  );
}