'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { Avatar, ConfirmDialog } from '@/components/ui/primitives';
import { AvatarPickerModal } from '@/components/profile/avatar-picker-modal';
import { api } from '@/lib/api';

export default function ProfileSettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [leaving, setLeaving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  async function save(field: 'fullName' | 'title' | 'username', value: string) {
    if (!user) return;
    const updated = await api.updateProfile({ [field]: value || undefined });
    setUser(updated);
  }

  async function handleAvatarSelect(dataUrl: string) {
    setAvatarSaving(true);
    try {
      const updated = await api.updateProfile({ avatarUrl: dataUrl });
      setUser(updated);
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await api.leaveWorkspace();
      logout();
      router.replace('/login');
    } finally {
      setLeaving(false);
      setLeaveConfirmOpen(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-fg">Profile</h1>

      <div className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border">
        <FieldRow label="Profile picture">
          <button
            onClick={() => setPickerOpen(true)}
            disabled={avatarSaving}
            className="flex items-center gap-3 disabled:opacity-60"
            aria-label="Change profile picture"
          >
            <span className="relative rounded-full group">
              <Avatar user={user} size={40} />
              <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <CameraIcon />
              </span>
            </span>
            <span className="text-sm text-fg-muted hover:text-fg transition-colors">{avatarSaving ? 'Saving…' : 'Change'}</span>
          </button>
        </FieldRow>

        <FieldRow label="Email">
          <div className="flex items-center gap-2 text-sm text-fg">
            {user.email || 'guest@pyramid.app'}
            <PencilIcon />
          </div>
        </FieldRow>

        <FieldRow label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => save('fullName', fullName)}
            className="w-64 h-9 rounded-lg bg-hover px-3 text-sm text-fg text-right focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </FieldRow>

        <FieldRow label="Title" hint="Your job title or role">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save('title', title)}
            placeholder="Your job title or role"
            className="w-64 h-9 rounded-lg bg-hover px-3 text-sm text-fg text-right placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </FieldRow>

        <FieldRow label="Username" hint="One word, like a nickname or first name">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => save('username', username)}
            placeholder="One word, like a nickname or first name"
            className="w-64 h-9 rounded-lg bg-hover px-3 text-sm text-fg text-right placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </FieldRow>
      </div>

      <h2 className="mt-8 text-base font-semibold text-fg">Workspace access</h2>
      <div className="mt-3 rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-sm text-fg-muted">Remove yourself from the workspace</p>
        <button
          onClick={() => setLeaveConfirmOpen(true)}
          className="h-9 px-3.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Leave Workspace
        </button>
      </div>

      <ConfirmDialog
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        onConfirm={handleLeave}
        title="Leave this workspace?"
        description="This removes your access and cannot be undone."
        confirmLabel="Leave Workspace"
        danger
        loading={leaving}
      />

      <AvatarPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        onSelect={handleAvatarSelect}
      />
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <p className="text-sm text-fg">{label}</p>
        {hint && <p className="text-xs text-fg-muted mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-fg-muted">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}