'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function LoginPage() {
  const { user, loading, loginAsGuest } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/tasks');
  }, [loading, user, router]);

  async function handleGuest() {
    setSubmitting(true);
    setError(null);
    try {
      await loginAsGuest();
      router.replace('/tasks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a guest session.');
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="flex items-center gap-2 mb-8">
        <Image src="/logo.svg" alt="Pyramid" width={28} height={28} className="rounded-md" />
        <span className="font-semibold text-fg">Pyramid</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-popover">
        <h1 className="text-xl font-semibold text-fg text-center">Let&apos;s get back on track</h1>
        <p className="mt-1.5 text-sm text-fg-muted text-center">Enter your email below to login to your account.</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGuest}
            disabled={submitting}
            className="h-10 rounded-lg bg-fg text-bg text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Starting session…' : 'Continue as Guest'}
          </button>
          <button
            onClick={handleGoogle}
            className="h-10 rounded-lg border border-border text-sm font-medium text-fg hover:bg-hover transition-colors flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Login with Google
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

        <p className="mt-6 text-xs text-fg-muted text-center leading-relaxed">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
