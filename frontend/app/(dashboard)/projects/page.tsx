'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/primitives';
import { ProjectsTable } from '@/components/projects/projects-table';
import type { Priority } from '@/lib/types';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
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
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const name = prompt('Project name');
            if (name?.trim()) createProject.mutate(name.trim());
          }}
        >
          <PlusIcon /> Add Project
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-fg-muted py-10">Loading projects…</p>
      ) : (
        <ProjectsTable projects={projects} onPriorityChange={(id, priority) => updatePriority.mutate({ id, priority })} />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
