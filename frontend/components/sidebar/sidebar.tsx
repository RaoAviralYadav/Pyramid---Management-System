'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import { useAuth, useTheme } from '@/app/providers';
import { Avatar } from '@/components/ui/primitives';
import { SettingsNav } from './settings-nav';
import { ACCENT_COLORS, type AccentColor } from '@/lib/types';
import { cn } from '@/lib/utils';

const ACCENT_SWATCH: Record<string, string> = {
  amber: '#d97706',
  blue: '#9333ea',
  pink: '#db2777',
  rose: '#e11d48',
  emerald: '#059669',
  black: '#18181b',
};

export function Sidebar({
  mobileOpen,
  onCloseMobile,
  collapsed,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isSettings = pathname?.startsWith('/settings');

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-border bg-bg transition-all duration-200 overflow-hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed && 'lg:w-0 lg:border-r-0',
        )}
      >
        {/* Fixed-width inner wrapper so content doesn't reflow/squish while
            the outer <aside> animates its width to 0 on collapse. */}
        <div className="w-64 h-full flex flex-col">
          {isSettings ? <SettingsNav onNavigate={onCloseMobile} /> : <WorkspaceNav onNavigate={onCloseMobile} />}
        </div>
      </aside>
    </>
  );
}

function WorkspaceNav({ onNavigate }: { onNavigate: () => void }) {
  const { user } = useAuth();
  const { theme, accent, setTheme, setAccent } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'theme' | 'color' | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  function openNow() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setSubmenu(null);
    }, 150);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative p-3" onMouseEnter={openNow} onMouseLeave={closeSoon}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-hover transition-colors"
        >
          <Avatar user={user} size={26} />
          <span className="flex-1 text-left text-sm font-medium text-fg truncate">{user?.fullName || 'Guest'}</span>
          <ChevronsUpDownIcon />
        </button>

        {open && (
          <div className="absolute left-3 right-3 top-[calc(100%-2px)] z-50 rounded-xl border border-border bg-card shadow-popover py-3">
            <div className="flex flex-col items-center px-4 pb-3">
              <Avatar user={user} size={56} />
              <p className="mt-2 text-sm font-medium text-fg">{user?.fullName || 'Guest'}</p>
              {user?.email && <p className="text-xs text-fg-muted">{user.email}</p>}
            </div>
            <div className="h-px bg-border mx-1 mb-1.5" />

            <div onMouseEnter={() => setSubmenu('theme')} className="relative">
              <RowButton icon={<SunIcon />} label="Change Theme" chevron />
              {submenu === 'theme' && (
                <div className="absolute left-[calc(100%+6px)] top-0 w-36 rounded-xl border border-border bg-card shadow-popover py-1.5">
                  <SubRow active={theme === 'light'} onClick={() => setTheme('light')} label="Light" icon={<SunIcon />} />
                  <SubRow active={theme === 'dark'} onClick={() => setTheme('dark')} label="Dark" icon={<MoonIcon />} />
                </div>
              )}
            </div>

            <div onMouseEnter={() => setSubmenu('color')} className="relative">
              <RowButton
                icon={<span className="h-3.5 w-3.5 rounded-[4px] shrink-0" style={{ background: ACCENT_SWATCH[accent] }} />}
                label="Color Mode"
                chevron
              />
              {submenu === 'color' && (
                <div className="absolute left-[calc(100%+6px)] top-0 w-40 rounded-xl border border-border bg-card shadow-popover py-1.5">
                  {ACCENT_COLORS.map((c) => {
                    const val = c.value.toLowerCase();
                    return (
                      <SubRow
                        key={c.value}
                        active={accent === val}
                        onClick={() => setAccent(val as Lowercase<AccentColor>)}
                        label={c.label}
                        icon={<span className="h-3.5 w-3.5 rounded-[4px] shrink-0" style={{ background: ACCENT_SWATCH[val] }} />}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div onMouseEnter={() => setSubmenu(null)}>
              <RowButton
                icon={<GearIcon />}
                label="Settings"
                onClick={() => {
                  setOpen(false);
                  onNavigate();
                  router.push('/settings/profile');
                }}
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pt-2 pb-1 text-xs font-medium text-fg-muted flex items-center gap-1">
          Workspace <ChevronDownIcon className="h-3 w-3" />
        </p>
        <NavLink href="/tasks" icon={<GridIcon />} label="Tasks" onNavigate={onNavigate} />
        <NavLink href="/projects" icon={<FolderIcon />} label="Projects" onNavigate={onNavigate} />
      </nav>
    </div>
  );
}

function NavLink({ href, icon, label, onNavigate }: { href: string; icon: ReactNode; label: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + '/');
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
        active ? 'bg-hover text-fg font-medium' : 'text-fg-muted hover:bg-hover hover:text-fg',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function RowButton({ icon, label, chevron, onClick }: { icon: ReactNode; label: string; chevron?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-fg hover:bg-hover transition-colors"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {chevron && <ChevronRightIcon />}
    </button>
  );
}

function SubRow({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-fg hover:bg-hover transition-colors">
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {active && <CheckIcon />}
    </button>
  );
}

/* ----------------------------------- icons ---------------------------------- */

function iconProps(className?: string) {
  return { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: cn('text-fg-muted shrink-0', className) };
}
function ChevronsUpDownIcon() { return <svg {...iconProps()}><path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></svg>; }
function ChevronDownIcon({ className }: { className?: string }) { return <svg {...iconProps(className)}><path d="m6 9 6 6 6-6" /></svg>; }
function ChevronRightIcon() { return <svg {...iconProps()}><path d="m9 18 6-6-6-6" /></svg>; }
function GridIcon() { return <svg {...iconProps()}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>; }
function FolderIcon() { return <svg {...iconProps()}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>; }
function SunIcon() { return <svg {...iconProps()}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>; }
function MoonIcon() { return <svg {...iconProps()}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>; }
function GearIcon() { return <svg {...iconProps()}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" /></svg>; }
function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0"><path d="M20 6 9 17l-5-5" /></svg>; }