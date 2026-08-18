'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../providers';
import { Sidebar } from '@/components/sidebar/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // Desktop collapse state persists across visits — mobile's hamburger
  // open/close is session-only (it's an overlay, not a layout choice).
  useEffect(() => {
    setCollapsed(localStorage.getItem('pyramid_sidebar_collapsed') === 'true');
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('pyramid_sidebar_collapsed', String(!c));
      return !c;
    });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-fg-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} collapsed={collapsed} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 h-11 px-3 border-b border-border shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-hover text-fg-muted shrink-0"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg hover:bg-hover text-fg-muted shrink-0"
            aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
            title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <SidebarIcon />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <Image src="/logo.svg" alt="Pyramid" width={20} height={20} className="rounded-md" />
            <span className="text-sm font-semibold">Pyramid</span>
          </div>
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}