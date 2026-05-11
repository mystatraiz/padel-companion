'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { AuthProvider, LoginScreen, useAuth } from './AuthProvider';
import { ProfileSetup } from './ProfileSetup';

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

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, dataReady, profileComplete } = useAuth();

  if (loading)          return <LoginScreen />;
  if (!user)            return <LoginScreen />;
  if (!profileComplete) return dataReady ? <ProfileSetup /> : <Spinner />;
  if (!dataReady)       return <Spinner />;

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
