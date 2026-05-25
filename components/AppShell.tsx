'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { useStore } from '@/lib/store';
import { useAuth } from './AuthProvider';
import { AddMatchModal } from './modals/AddMatch';
import { AddEquipmentModal } from './modals/AddEquipment';

type ModalType = 'add-match' | 'add-equipment' | null;

interface ToastState {
  message: string;
  id: number;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((s) => s.user);
  const { signOut, user: authUser } = useAuth();
  const [modal, setModal] = useState<ModalType>(null);
  const [toast, setToastState] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToastState({ message, id });
    setTimeout(() => setToastState((t) => (t?.id === id ? null : t)), 2400);
  }, []);

  const nav = [
    { id: 'home',    label: 'Accueil', href: '/',        icon: 'home'  },
    { id: 'weight',  label: 'Poids',   href: '/weight',  icon: 'scale' },
    { id: 'fasting', label: 'Jeûne',   href: '/fasting', icon: 'flame' },
    { id: 'padel',   label: 'Padel',   href: '/padel',   icon: 'racket'},
    { id: 'profile', label: 'Profil',  href: '/profile', icon: 'user'  },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/padel') return ['/padel','/calendar','/stats','/analyse','/equipment','/match','/reserve'].some(p => pathname.startsWith(p));
    return pathname.startsWith(href);
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">PP</div>
          <div className="brand-text">
            <div className="brand-name">PadelPulse</div>
            <div className="brand-sub">v1.0</div>
          </div>
        </div>

        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => router.push(item.href)}
          >
            <span className="ico">
              <Icon name={item.icon} size={18} />
            </span>
            <span className="label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar-foot" onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar">{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {authUser?.displayName ?? user.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
              Niveau {user.level}/8
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); signOut(); }}
            title="Déconnexion"
            style={{
              background: 'none', border: 'none', padding: 4, cursor: 'pointer',
              color: 'var(--ink-faint)', flexShrink: 0, display: 'flex', alignItems: 'center',
              borderRadius: 6, transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-faint)')}
          >
            <Icon name="logout" size={15} />
          </button>
        </div>
      </nav>

      <main className="main">
        {/* Pass modal opener and toast via context would be ideal, but for simplicity we clone children */}
        <ShellContext.Provider value={{ openModal: setModal, showToast }}>
          {children}
        </ShellContext.Provider>
      </main>

      {modal === 'add-match' && (
        <AddMatchModal
          close={() => setModal(null)}
          toast={showToast}
        />
      )}
      {modal === 'add-equipment' && (
        <AddEquipmentModal
          close={() => setModal(null)}
          toast={showToast}
        />
      )}

      {toast && (
        <div key={toast.id} className="toast">
          <Icon name="check" size={14} />
          {toast.message}
        </div>
      )}
    </div>
  );
}

import { createContext, useContext } from 'react';

interface ShellContextValue {
  openModal: (modal: ModalType) => void;
  showToast: (message: string) => void;
}

const ShellContext = createContext<ShellContextValue>({
  openModal: () => {},
  showToast: () => {},
});

export const useShell = () => useContext(ShellContext);
