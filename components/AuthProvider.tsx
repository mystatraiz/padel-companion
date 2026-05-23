'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut as fbSignOut,
  GoogleAuthProvider, type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserSetupStatus, seedDefaultData, subscribeUserData, subscribeFasting } from '@/lib/firestore';
import { useStore } from '@/lib/store';

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthCtx {
  user:            User | null;
  loading:         boolean;
  dataReady:       boolean;
  profileComplete: boolean;
  completeProfile: () => void;
  signIn:          () => Promise<void>;
  signOut:         () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true, dataReady: false, profileComplete: false,
  completeProfile: () => {}, signIn: async () => {}, signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,            setUser]            = useState<User | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [dataReady,       setDataReady]       = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  const unsubDataRef = useRef<(() => void) | null>(null);

  const setUid       = useStore((s) => s.setUid);
  const setStoreUser = useStore((s) => s.setUser);
  const setMatches   = useStore((s) => s.setMatches);
  const setEquipment = useStore((s) => s.setEquipment);
  const setUpcoming  = useStore((s) => s.setUpcoming);
  const setFasting   = useStore((s) => s.setFasting);

  const unsubFastingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      unsubDataRef.current?.();
      unsubDataRef.current = null;
      unsubFastingRef.current?.();
      unsubFastingRef.current = null;

      if (firebaseUser) {
        setUser(firebaseUser);
        setUid(firebaseUser.uid);

        try {
          // One Firestore read: get user doc status
          const { isNew, profileComplete: pc, profile } = await getUserSetupStatus(firebaseUser.uid);

          if (isNew) {
            await seedDefaultData(firebaseUser.uid, firebaseUser.displayName);
            setProfileComplete(false);
          } else {
            setProfileComplete(pc);
            // Load saved profile into store
            if (pc && profile) {
              const firstName = (profile as any).firstName ?? '';
              const lastName  = (profile as any).lastName  ?? '';
              const name      = `${firstName} ${lastName}`.trim() || firebaseUser.displayName || 'Joueur';
              const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase()
                                || name[0].toUpperCase();
              setStoreUser({ name, initials, level: (profile as any).level ?? 5, ...profile });
            }
          }

          // Subscribe to Firestore collections
          const ready = { m: false, e: false, u: false };
          const checkAllReady = () => {
            if (ready.m && ready.e && ready.u) setDataReady(true);
          };

          unsubDataRef.current = subscribeUserData(
            firebaseUser.uid,
            (m) => { setMatches(m);   if (!ready.m) { ready.m = true; checkAllReady(); } },
            (e) => { setEquipment(e); if (!ready.e) { ready.e = true; checkAllReady(); } },
            (u) => { setUpcoming(u);  if (!ready.u) { ready.u = true; checkAllReady(); } },
          );
          unsubFastingRef.current = subscribeFasting(firebaseUser.uid, setFasting);
        } catch (err) {
          console.error('Firestore init error:', err);
          // Still show the app — profile setup will handle missing data
          setProfileComplete(false);
          setDataReady(true);
        }
      } else {
        setUser(null);
        setUid(null);
        setDataReady(false);
        setProfileComplete(false);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubDataRef.current?.();
      unsubFastingRef.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn          = async () => { await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()); };
  const signOut         = async () => { await fbSignOut(getFirebaseAuth()); };
  const completeProfile = ()       => setProfileComplete(true);

  return (
    <AuthContext.Provider value={{ user, loading, dataReady, profileComplete, completeProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

export function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    try { await signIn(); } finally { setBusy(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)', padding: '2rem', gap: '2rem' }}>
      <div style={{ width: 80, height: 80, borderRadius: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', fontFamily: 'var(--font-inter-tight)' }}>
        PP
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>PadelPulse</div>
        <div style={{ fontSize: 14, color: 'var(--ink-faint)' }}>Connecte-toi pour accéder à tes stats</div>
      </div>
      <button
        onClick={handleSignIn} disabled={busy}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'var(--bg-elev)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 15, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'var(--font-inter-tight)', transition: 'opacity 0.15s' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {busy ? 'Connexion…' : 'Continuer avec Google'}
      </button>
    </div>
  );
}
