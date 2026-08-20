'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PRIORITIES, type Project, type Priority, type TaskStatus } from '@/lib/types';
import {
  Avatar,
  Popover,
  PopoverItem,
  PriorityIcon,
  PriorityTag,
  useClickOutside,
} from '@/components/ui/primitives';
import { TaskToolbar, type VisibleFields } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskBoard } from '@/components/tasks/task-board';
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu';
import { PRIORITY_LABEL, cn, formatDate } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [visibleFields, setVisibleFields] = useState<VisibleFields>({ priority: true, members: true, dueDate: true, labels: true });
  const [openMenu, setOpenMenu] = useState<'priority' | 'lead' | 'date' | null>(null);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => api.users.list() });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', params.projectId],
    queryFn: () => api.projects.get(params.projectId),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { projectId: params.projectId }],
    queryFn: () => api.tasks.list({ projectId: params.projectId }),
  });

  const updateProject = useMutation({
    mutationFn: (data: Partial<Project>) => api.projects.update(params.projectId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['project', params.projectId], updated);
      queryClient.setQueryData(['projects'], (old: Project[] | undefined) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', params.projectId] });
    },
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
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === 'priority' ? null : 'priority')}
                      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm hover:bg-hover transition-colors"
                    >
                      <PriorityTag priority={project.priority} />
                    </button>
                    <Popover open={openMenu === 'priority'} onClose={() => setOpenMenu(null)} anchorClassName="left-0 top-[calc(100%+6px)] w-44">
                      {PRIORITIES.map((p) => (
                        <PopoverItem
                          key={p}
                          onClick={() => {
                            updateProject.mutate({ priority: p });
                            setOpenMenu(null);
                          }}
                        >
                          <PriorityIcon priority={p} /> {PRIORITY_LABEL[p]}
                          {project.priority === p && <CheckIcon />}
                        </PopoverItem>
                      ))}
                    </Popover>
                  </div>
                </InfoField>

                <InfoField label="Team lead">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === 'lead' ? null : 'lead')}
                      className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-hover transition-colors"
                    >
                      {project.lead ? (
                        <>
                          <Avatar user={project.lead} size={22} />
                          <span className="text-fg">{project.lead.fullName || project.lead.username || 'Lead'}</span>
                        </>
                      ) : (
                        <span className="text-fg-muted">Unassigned</span>
                      )}
                    </button>
                    <Popover open={openMenu === 'lead'} onClose={() => setOpenMenu(null)} anchorClassName="left-0 top-[calc(100%+6px)] w-56">
                      {users.map((user) => {
                        const active = project.leadId === user.id;
                        return (
                          <PopoverItem
                            key={user.id}
                            onClick={() => {
                              updateProject.mutate({ leadId: active ? null : user.id });
                              setOpenMenu(null);
                            }}
                          >
                            <Avatar user={user} size={20} />
                            <span className="flex-1 truncate">{user.fullName || user.username}</span>
                            {active && <CheckIcon />}
                          </PopoverItem>
                        );
                      })}
                    </Popover>
                  </div>
                </InfoField>

                <InfoField label="Due date">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === 'date' ? null : 'date')}
                      className="rounded-md px-1.5 py-1 text-sm text-fg-muted hover:bg-hover hover:text-fg transition-colors"
                    >
                      {formatDate(project.dueDate) ?? 'No due date'}
                    </button>
                    {openMenu === 'date' && (
                      <DatePickerPopover
                        value={project.dueDate ?? ''}
                        onChange={(value) => {
                          updateProject.mutate({ dueDate: value || null });
                          setOpenMenu(null);
                        }}
                        onClose={() => setOpenMenu(null)}
                      />
                    )}
                  </div>
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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-accent ml-auto shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DatePickerPopover({ value, onChange, onClose }: { value: string; onChange: (value: string) => void; onClose: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(onClose);
  const [date, setDate] = useState(value || '');

  return (
    <div ref={ref} className="absolute left-0 top-[calc(100%+6px)] z-50 rounded-xl border border-border bg-card shadow-popover p-3">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-9 rounded-lg border border-border bg-bg px-2 text-sm text-fg focus:outline-none"
      />
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClose();
          }}
          className="h-8 px-2.5 rounded-lg text-xs text-fg-muted hover:bg-hover transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(date);
            onClose();
          }}
          className="h-8 px-2.5 rounded-lg bg-fg text-bg text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  );
}