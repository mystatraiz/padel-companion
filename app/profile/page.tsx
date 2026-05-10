'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';

const THEMES = [
  { id: 'court' as const, name: 'Court', desc: 'Vert padel · clair', swatches: ['#f4f1ea', '#1f6b4a', '#c8e87a', '#14241c'] },
  { id: 'neon' as const, name: 'Neon', desc: 'Sombre · lime/cyan', swatches: ['#0c0e10', '#c8ff3e', '#36e0d9', '#15181b'] },
  { id: 'clay' as const, name: 'Clay', desc: 'Terre battue · chaud', swatches: ['#f6ede2', '#b8492a', '#2f5d3a', '#2a1c12'] },
];

const NOTIF_ITEMS = [
  { label: 'Rappel avant match', sub: '30 min avant le créneau', defaultOn: true },
  { label: 'Alerte usure matériel', sub: 'Au-dessus de 80%', defaultOn: true },
  { label: 'Récap hebdomadaire', sub: 'Tous les lundis', defaultOn: false },
  { label: 'Synchro Google Calendar', sub: 'Connecté à alex@gmail', defaultOn: true },
];

export default function ProfilePage() {
  const { user, matches, theme, setTheme, reset } = useStore();
  const [notifs, setNotifs] = useState(NOTIF_ITEMS.map((n) => n.defaultOn));
  const totalHours = matches.reduce((s, m) => s + m.duration, 0);

  const handleReset = () => {
    if (window.confirm('Réinitialiser ?')) reset();
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

      <div className="section" style={{ marginTop: 8 }}>
        <div className="section-head">
          <h2 className="section-title">Apparence</h2>
        </div>
        <div className="page-sub" style={{ marginTop: -4, marginBottom: 14, fontSize: 13 }}>
          Choisis le thème qui te correspond. Le réglage est mémorisé.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {THEMES.map((t) => (
            <div
              key={t.id}
              className={`theme-card ${theme === t.id ? 'selected' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <div className="check">
                <Icon name="check" size={12} />
              </div>
              <div className="swatch-row">
                {t.swatches.map((c, i) => (
                  <div key={i} className="sw" style={{ background: c }} />
                ))}
              </div>
              <div className="name">{t.name}</div>
              <div className="desc">{t.desc}</div>
            </div>
          ))}
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
              <div style={{ fontSize: 14, fontWeight: 500 }}>Réinitialiser les données de démo</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                Restaure l&apos;état initial — utile pour tester l&apos;app
              </div>
            </div>
            <button className="btn" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
