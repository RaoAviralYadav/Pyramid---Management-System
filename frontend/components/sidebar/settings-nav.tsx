'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: PersonIcon },
  { href: '/settings/theme', label: 'Theme', icon: SunIcon },
  { href: '/settings/color', label: 'Color', icon: SquareIcon },
];

export function SettingsNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const filtered = ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col h-full p-3">
      <Link
        href="/tasks"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-fg-muted hover:bg-hover hover:text-fg transition-colors"
      >
        <ArrowLeftIcon />
        Back to app
      </Link>

      <div className="mt-3 relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full h-9 rounded-lg border border-border bg-bg pl-8 pr-3 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <nav className="mt-3 flex flex-col gap-0.5">
        {filtered.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                active ? 'bg-hover text-fg font-medium' : 'text-fg-muted hover:bg-hover hover:text-fg',
              )}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function iconProps(className?: string) {
  return {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: cn('shrink-0', className),
  };
}
function ArrowLeftIcon() { return <svg {...iconProps()}><path d="m12 19-7-7 7-7M5 12h14" /></svg>; }
function SearchIcon({ className }: { className?: string }) { return <svg {...iconProps(cn('text-fg-muted', className))}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function PersonIcon() { return <svg {...iconProps()}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>; }
function SunIcon() { return <svg {...iconProps()}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>; }
function SquareIcon() { return <svg {...iconProps()}><rect x="3" y="3" width="18" height="18" rx="4" /></svg>; }
