'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, ThemeMode as ApiThemeMode, AccentColor as ApiAccentColor } from '@/lib/types';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

interface ThemeContextValue {
  theme: ThemeMode;
  accent: AccentColor;
  setTheme: (t: ThemeMode) => void;
  setAccent: (a: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <Providers>');
  return ctx;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <Providers>');
  return ctx;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [accent, setAccentState] = useState<AccentColor>('blue');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: read persisted theme/accent, then (if a token exists)
  // validate it against the API and hydrate the user + their saved prefs.
  useEffect(() => {
    const storedTheme = (localStorage.getItem('pyramid_theme') as ThemeMode) || 'light';
    const storedAccent = (localStorage.getItem('pyramid_accent') as AccentColor) || 'blue';
    setThemeState(storedTheme);
    setAccentState(storedAccent);

    const token = localStorage.getItem('pyramid_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((u) => {
        setUser(u);
        setThemeState((u.theme?.toLowerCase() as ThemeMode) || storedTheme);
        setAccentState((u.accentColor?.toLowerCase() as AccentColor) || storedAccent);
      })
      .catch(() => localStorage.removeItem('pyramid_token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pyramid_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('pyramid_accent', accent);
  }, [accent]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    if (user) api.updatePreferences({ theme: t.toUpperCase() as ApiThemeMode }).catch(() => {});
  };

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    if (user) api.updatePreferences({ accentColor: a.toUpperCase() as ApiAccentColor }).catch(() => {});
  };

  const loginAsGuest = async () => {
    const { accessToken, user: guestUser } = await api.guestLogin();
    localStorage.setItem('pyramid_token', accessToken);
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('pyramid_token');
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, accent, setTheme, setAccent }}>
        <AuthContext.Provider value={{ user, loading, setUser, loginAsGuest, logout }}>{children}</AuthContext.Provider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
