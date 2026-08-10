'use client';

import { useTheme } from '@/app/providers';
import { cn } from '@/lib/utils';

const OPTIONS: { value: 'light' | 'dark'; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-fg">Theme</h1>
      <p className="mt-1 text-sm text-fg-muted">Choose how Pyramid looks on this device. Saved automatically and remembered next time you sign in.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'rounded-2xl border-2 p-4 text-left transition-colors',
              theme === opt.value ? 'border-accent' : 'border-border hover:border-fg-muted',
            )}
          >
            <div
              className={cn(
                'h-20 rounded-lg border border-border mb-3 flex flex-col gap-1.5 p-2',
                opt.value === 'light' ? 'bg-white' : 'bg-[#131314]',
              )}
            >
              <div className={cn('h-2 w-8 rounded-full', opt.value === 'light' ? 'bg-zinc-800' : 'bg-zinc-200')} />
              <div className={cn('h-2 w-14 rounded-full', opt.value === 'light' ? 'bg-zinc-200' : 'bg-zinc-700')} />
              <div className={cn('h-2 w-10 rounded-full', opt.value === 'light' ? 'bg-zinc-200' : 'bg-zinc-700')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg">{opt.label}</span>
              {theme === opt.value && <CheckDot />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckDot() {
  return (
    <span className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
