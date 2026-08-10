'use client';

import { useTheme } from '@/app/providers';
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

export default function ColorSettingsPage() {
  const { accent, setAccent } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-fg">Color</h1>
      <p className="mt-1 text-sm text-fg-muted">Pick an accent color. It's used for buttons, links, and selection states across the app.</p>

      <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-lg">
        {ACCENT_COLORS.map((c) => {
          const val = c.value.toLowerCase();
          const active = accent === val;
          return (
            <button
              key={c.value}
              onClick={() => setAccent(val as Lowercase<AccentColor>)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors',
                active ? 'border-accent' : 'border-transparent hover:border-border',
              )}
            >
              <span
                className="h-9 w-9 rounded-full flex items-center justify-center"
                style={{ background: ACCENT_SWATCH[val] }}
              >
                {active && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-fg-muted">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
