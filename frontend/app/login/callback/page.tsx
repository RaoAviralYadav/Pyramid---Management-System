'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../providers';
import { api } from '@/lib/api';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    localStorage.setItem('pyramid_token', token);
    api
      .me()
      .then((user) => {
        setUser(user);
        router.replace('/tasks');
      })
      .catch(() => router.replace('/login'));
  }, [params, router, setUser]);

  return <p className="text-sm text-fg-muted">Signing you in…</p>;
}

export default function LoginCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Suspense fallback={<p className="text-sm text-fg-muted">Signing you in…</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
