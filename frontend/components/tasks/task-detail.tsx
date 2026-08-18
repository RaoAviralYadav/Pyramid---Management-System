'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Avatar, LabelPill, useInlineAdd } from '@/components/ui/primitives';
import type { Task } from '@/lib/types';
import { formatDate, isOverdue } from '@/lib/utils';
import { DetailsPanel, SubtasksTable, CommentsThread } from './task-detail-sections';

const SUGGESTED_LABELS = ['Research', 'Design', 'Development', 'Testing', 'Deployment'];

function displayUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function TaskDetail({ task }: { task: Task }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [copied, setCopied] = useState(false);

  const update = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.tasks.update(task.id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['task', task.id], updated);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function toggleLabel(label: string) {
    const next = task.labels.includes(label) ? task.labels.filter((l) => l !== label) : [...task.labels, label];
    update.mutate({ labels: next });
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail
      // quietly rather than throwing an error over a copy-link button.
    }
  }

  const resourceAdd = useInlineAdd((value) => {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    update.mutate({ resources: [...task.resources, url] });
  });

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto px-6 sm:px-10 py-6">
        <div className="flex items-center justify-end gap-1 text-fg-muted mb-4">
          <IconBtn><LockIcon /></IconBtn>
          <IconBtn><EyeIcon />1</IconBtn>
          <IconBtn onClick={handleShare}>
            <ShareIcon /> {copied && 'Copied!'}
          </IconBtn>
          <IconBtn><MoreIcon /></IconBtn>
          <IconBtn onClick={() => router.push('/tasks')}><CloseIcon /></IconBtn>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && update.mutate({ title: title.trim() })}
          className="w-full text-2xl font-semibold text-fg bg-transparent focus:outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== (task.description ?? '') && update.mutate({ description })}
          placeholder="Add a description…"
          rows={2}
          className="w-full mt-2 text-sm text-fg-muted bg-transparent resize-none focus:outline-none placeholder:text-fg-muted/60"
        />

        <Row label="Properties">
          {task.taskType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border pl-1 pr-2.5 py-1 text-xs text-fg">
              <Avatar user={task.assignees[0]} size={18} />
              {task.taskType}
            </span>
          )}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'bg-red-500/10 text-red-500' : 'bg-hover text-fg-muted'
              }`}
            >
              <CalendarIcon /> {formatDate(task.dueDate)}
            </span>
          )}
        </Row>

        <Row label="Labels">
          {SUGGESTED_LABELS.map((l) => (
            <button key={l} onClick={() => toggleLabel(l)} className={task.labels.includes(l) ? '' : 'opacity-40 hover:opacity-100 transition-opacity'}>
              <LabelPill label={l} />
            </button>
          ))}
        </Row>

        <Row label="Resources">
          <div className="w-full flex flex-col gap-1">
            {task.resources.map((url) => (
              <div key={url} className="flex items-center gap-1.5 group/resource -ml-1.5">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-fg hover:underline truncate px-1.5 py-1 rounded-md hover:bg-hover"
                >
                  <LinkIcon /> {displayUrl(url)}
                </a>
                <button
                  onClick={() => update.mutate({ resources: task.resources.filter((u) => u !== url) })}
                  className="opacity-0 group-hover/resource:opacity-100 h-6 w-6 flex items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-red-500 transition-opacity"
                  aria-label="Remove link"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}

            {resourceAdd.editing ? (
              <input
                {...resourceAdd.inputProps}
                placeholder="Paste a link and press Enter"
                className="h-8 w-full max-w-sm rounded-lg border border-accent bg-bg px-2.5 text-sm text-fg placeholder:text-fg-muted focus:outline-none"
              />
            ) : (
              <button
                onClick={resourceAdd.start}
                className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors w-fit"
              >
                <PaperclipIcon /> Add document or link…
              </button>
            )}
          </div>
        </Row>

        <div className="mt-8">
          <button onClick={() => setSubtasksOpen((o) => !o)} className="flex items-center gap-1.5 text-sm font-medium text-fg mb-2">
            <ChevronIcon open={subtasksOpen} /> Subtasks
          </button>
          {subtasksOpen && <SubtasksTable task={task} />}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-fg mb-3">Comments</h3>
          <CommentsThread task={task} />
        </div>
      </div>

      <div className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
        <DetailsPanel task={task} onUpdate={(data) => update.mutate(data)} />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 mt-4 text-sm">
      <span className="w-20 shrink-0 text-fg-muted pt-1">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-7 px-1.5 flex items-center gap-1 rounded-md text-xs hover:bg-hover hover:text-fg transition-colors">
      {children}
    </button>
  );
}

function iconProps() {
  return { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
}
function LockIcon() { return <svg {...iconProps()}><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function EyeIcon() { return <svg {...iconProps()}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function ShareIcon() { return <svg {...iconProps()}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 3.9M15.4 6.5 8.6 10.4" /></svg>; }
function MoreIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>; }
function CloseIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>; }
function CalendarIcon() { return <svg {...iconProps()}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function PaperclipIcon() { return <svg {...iconProps()}><path d="m21.4 11.6-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 1 1-3-3l8-8" /></svg>; }
function LinkIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-fg-muted"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></svg>; }
function ChevronIcon({ open }: { open: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-fg-muted ${open ? '' : '-rotate-90'}`}><path d="m6 9 6 6 6-6" /></svg>;
}