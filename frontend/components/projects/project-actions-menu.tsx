'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, ConfirmDialog, Divider, Modal, Popover, PopoverItem } from '@/components/ui/primitives';
import type { Project } from '@/lib/types';

export function ProjectActionsMenu({ project, className }: { project: Project; className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(project.name);

  const rename = useMutation({
    mutationFn: (nextName: string) => api.projects.update(project.id, { name: nextName }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['project', project.id], updated);
      queryClient.setQueryData(['projects'], (old: Project[] | undefined) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setRenameOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => api.projects.remove(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setConfirmOpen(false);
      router.push('/projects');
    },
  });

  return (
    <div className={`relative ${className ?? ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg transition-colors"
        aria-label="Project options"
      >
        <MoreIcon />
      </button>

      <Popover open={open} onClose={() => setOpen(false)} anchorClassName="right-0 top-[calc(100%+4px)] w-48">
        <PopoverItem
          onClick={() => {
            setOpen(false);
            router.push(`/projects/${project.id}`);
          }}
        >
          <OpenIcon /> Open project details
        </PopoverItem>

        <Divider />

        <PopoverItem
          onClick={() => {
            setName(project.name);
            setOpen(false);
            setRenameOpen(true);
          }}
        >
          <EditIcon /> Rename project
        </PopoverItem>

        <Divider />

        <PopoverItem
          onClick={() => {
            setOpen(false);
            setConfirmOpen(true);
          }}
        >
          <TrashIcon />
          <span className="text-red-500">Delete project</span>
        </PopoverItem>
      </Popover>

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename project" className="max-w-sm">
        <label className="block text-sm text-fg-muted mb-2">Project name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setRenameOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const trimmed = name.trim();
              if (!trimmed) return;
              rename.mutate(trimmed);
            }}
            disabled={rename.isPending || !name.trim()}
          >
            {rename.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this project?"
        description={`"${project.name}" and all of its tasks will be permanently deleted.`}
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

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
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
