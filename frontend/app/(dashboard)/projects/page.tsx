'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, useClickOutside } from '@/components/ui/primitives';
import { ProjectsTable } from '@/components/projects/projects-table';
import type { Priority } from '@/lib/types';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const { data: projects = [], isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => api.projects.list() });

  const createProject = useMutation({
    mutationFn: (name: string) => api.projects.create({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const updatePriority = useMutation({
    mutationFn: (vars: { id: string; priority: Priority }) => api.projects.update(vars.id, { priority: vars.priority }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-fg">Projects</h1>
        <div className="relative">
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <PlusIcon /> Add Project
          </Button>
          <AddProjectPopover
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={(name) => createProject.mutate(name)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-fg-muted py-10">Loading projects…</p>
      ) : (
        <ProjectsTable projects={projects} onPriorityChange={(id, priority) => updatePriority.mutate({ id, priority })} />
      )}
    </div>
  );
}

function AddProjectPopover({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');
  const ref = useClickOutside<HTMLFormElement>(onClose);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
    onClose();
  }

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-xl border border-border bg-card shadow-popover p-3"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          Add Project
        </Button>
      </div>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}