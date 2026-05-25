'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { fsClearUserData } from '@/lib/firestore';

const NOTIF_ITEMS = [
  { label: 'Rappel avant match', sub: '30 min avant le créneau', defaultOn: true },
  { label: 'Alerte usure matériel', sub: 'Au-dessus de 80%', defaultOn: true },
  { label: 'Récap hebdomadaire', sub: 'Tous les lundis', defaultOn: false },
  { label: 'Synchro Google Calendar', sub: 'Connecté à alex@gmail', defaultOn: true },
];

export default function ProfilePage() {
  const { user, matches, reset } = useStore();
  const [notifs, setNotifs] = useState(NOTIF_ITEMS.map((n) => n.defaultOn));
  const totalHours = matches.reduce((s, m) => s + m.duration, 0);

  const uid = useStore((s) => s.uid);
  const [clearing, setClearing] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Supprimer toutes tes données (matchs, équipement, agenda) ?')) return;
    setClearing(true);
    try {
      if (uid) await fsClearUserData(uid);
      reset();
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Profil</div>
          <h1 className="page-title">{user.name}</h1>
          <div className="page-sub">
            Niveau {user.level}/8 · {matches.length} matchs joués · {totalHours.toFixed(1)}h
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Notifications</h2>
        </div>
        <div className="card">
          {NOTIF_ITEMS.map((n, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{n.sub}</div>
              </div>
              <div
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 999,
                  background: notifs[i] ? 'var(--accent)' : 'var(--line)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background .15s',
                  flexShrink: 0,
                }}
                onClick={() =>
                  setNotifs((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                }
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: notifs[i] ? 18 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left .15s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Données</h2>
        </div>
        <div className="card">
          <div className="flex-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--warn)' }}>Supprimer toutes mes données</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                Efface définitivement matchs, équipement et agenda
              </div>
            </div>
            <button className="btn" onClick={handleReset} disabled={clearing}
              style={{ borderColor: 'var(--warn)', color: 'var(--warn)', opacity: clearing ? 0.6 : 1 }}>
              {clearing ? '…' : 'Effacer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
