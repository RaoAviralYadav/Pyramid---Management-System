import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-secondary': 'var(--bg-secondary)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        border: 'var(--border)',
        card: 'var(--card)',
        hover: 'var(--hover)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        'accent-soft': 'var(--accent-soft)',
        danger: '#ef4444',
        'priority-urgent': '#ef4444',
        'priority-high': '#ef4444',
        'priority-medium': '#f97316',
        'priority-low': '#71717a',
        'priority-none': '#a1a1aa',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        popover: '0 10px 38px -10px rgba(0,0,0,0.18), 0 10px 20px -15px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
