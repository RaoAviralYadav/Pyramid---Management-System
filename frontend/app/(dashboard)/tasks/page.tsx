'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TaskStatus } from '@/lib/types';
import { TaskToolbar, type VisibleFields } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskBoard } from '@/components/tasks/task-board';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [visibleFields, setVisibleFields] = useState<VisibleFields>({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.tasks.list(),
  });

  const createTask = useMutation({
    mutationFn: (vars: { title: string; status: TaskStatus }) => api.tasks.create(vars),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const moveTask = useMutation({
    mutationFn: (vars: { id: string; status: TaskStatus }) => api.tasks.update(vars.id, { status: vars.status }),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old: typeof tasks = []) =>
        old.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const filtered = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => statusFilter.length === 0 || statusFilter.includes(t.status));

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-lg font-semibold text-fg">Tasks</h1>
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
            onAddTask={(status) => {
              const title = prompt('Task title');
              if (title?.trim()) createTask.mutate({ title: title.trim(), status });
            }}
          />
        ) : (
          <TaskBoard
            tasks={filtered}
            visibleFields={visibleFields}
            onMove={(id, status) => moveTask.mutate({ id, status })}
            onAddTask={(status) => {
              const title = prompt('Task title');
              if (title?.trim()) createTask.mutate({ title: title.trim(), status });
            }}
          />
        )}
      </div>
    </div>
  );
}
