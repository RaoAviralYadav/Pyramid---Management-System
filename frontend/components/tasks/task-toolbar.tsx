'use client';

import { useState } from 'react';
import { Button, Checkbox, Popover, useClickOutside } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/utils';

export interface VisibleFields {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
}

interface Props {
  view: 'list' | 'board';
  onViewChange: (v: 'list' | 'board') => void;
  search: string;
  onSearchChange: (v: string) => void;
  visibleFields: VisibleFields;
  onFieldsChange: (f: VisibleFields) => void;
  statusFilter: TaskStatus[];
  onStatusFilterChange: (s: TaskStatus[]) => void;
  onAddTask: (title: string) => void;
}

export function TaskToolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
  visibleFields,
  onFieldsChange,
  statusFilter,
  onStatusFilterChange,
  onAddTask,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="px-6 pb-3 flex items-center justify-between gap-2 border-b border-border">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {searchOpen ? (
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              autoFocus
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => !search && setSearchOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              placeholder="Search"
              className="h-9 w-56 rounded-lg border border-border bg-card pl-8 pr-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setSearchOpen(true)} aria-label="Search">
            <SearchIcon />
          </Button>
        )}

        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setFieldsOpen((o) => !o)}>
            <FieldsIcon /> Fields
          </Button>
          <Popover open={fieldsOpen} onClose={() => setFieldsOpen(false)} anchorClassName="right-0 top-[calc(100%+6px)] w-56">
            <div className="px-1 pb-1.5 mb-1 border-b border-border">
              <div className="flex rounded-lg bg-hover p-0.5 mx-2 mb-1.5">
                {(['list', 'board'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => onViewChange(v)}
                    className={cn(
                      'flex-1 h-7 rounded-md text-xs font-medium capitalize transition-colors',
                      view === v ? 'bg-card shadow-sm text-fg' : 'text-fg-muted',
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <Checkbox label="Priority" checked={visibleFields.priority} onChange={() => onFieldsChange({ ...visibleFields, priority: !visibleFields.priority })} />
            <Checkbox label="Members" checked={visibleFields.members} onChange={() => onFieldsChange({ ...visibleFields, members: !visibleFields.members })} />
            <Checkbox label="Due Date" checked={visibleFields.dueDate} onChange={() => onFieldsChange({ ...visibleFields, dueDate: !visibleFields.dueDate })} />
            <Checkbox label="Labels" checked={visibleFields.labels} onChange={() => onFieldsChange({ ...visibleFields, labels: !visibleFields.labels })} />
          </Popover>
        </div>

        <div className="relative">
          <Button variant="secondary" size="sm" onClick={() => setFilterOpen((o) => !o)}>
            <FilterIcon /> Filter
            {statusFilter.length > 0 && (
              <span className="ml-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">
                {statusFilter.length}
              </span>
            )}
          </Button>
          <Popover open={filterOpen} onClose={() => setFilterOpen(false)} anchorClassName="right-0 top-[calc(100%+6px)] w-48">
            <p className="px-3 pb-1 text-xs font-medium text-fg-muted">Status</p>
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
              <Checkbox
                key={s}
                label={STATUS_LABEL[s]}
                checked={statusFilter.includes(s)}
                onChange={() =>
                  onStatusFilterChange(statusFilter.includes(s) ? statusFilter.filter((x) => x !== s) : [...statusFilter, s])
                }
              />
            ))}
          </Popover>
        </div>

        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon /> Add Task
          </Button>
          <AddTaskPopover open={addOpen} onClose={() => setAddOpen(false)} onSubmit={onAddTask} />
        </div>
      </div>
    </div>
  );
}

function AddTaskPopover({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (title: string) => void }) {
  const [title, setTitle] = useState('');
  const ref = useClickOutside<HTMLFormElement>(onClose);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle('');
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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full h-9 rounded-lg border border-border bg-bg px-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          Add Task
        </Button>
      </div>
    </form>
  );
}

function iconProps(className?: string) {
  return { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className };
}
function SearchIcon({ className }: { className?: string }) { return <svg {...iconProps(className)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function FieldsIcon() { return <svg {...iconProps()}><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>; }
function FilterIcon() { return <svg {...iconProps()}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" /></svg>; }
function PlusIcon() { return <svg {...iconProps()}><path d="M12 5v14M5 12h14" /></svg>; }
