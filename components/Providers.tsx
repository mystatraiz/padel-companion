'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { AuthProvider, LoginScreen, useAuth } from './AuthProvider';

// ─── Theme sync ───────────────────────────────────────────────────────────────

function ThemeSync() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'court') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
  return null;
}

// ─── Auth gate (shows login screen when not authenticated) ────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, dataReady } = useAuth();

  // Still checking auth state
  if (loading) return <LoginScreen />;

  // Not authenticated → show login
  if (!user) return <LoginScreen />;

  // Authenticated but Firestore data not yet loaded → spinner
  if (!dataReady) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', background: 'var(--bg)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid var(--accent)', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );

  return <>{children}</>;
}

// ─── Root providers ───────────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeSync />
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
