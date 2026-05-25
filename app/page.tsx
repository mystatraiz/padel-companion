'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useStore, MONTHS_FR, fastingStreaks } from '@/lib/store';
import { useShell } from '@/components/AppShell';

// ─── Widget Poids ─────────────────────────────────────────────────────────────

function WeightWidget() {
  const router = useRouter();
  const { weightEntries } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const sorted  = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
  const todayEntry = sorted.find((w) => w.date === today);
  const latest  = sorted[0]?.weight ?? null;
  const prev    = sorted[1]?.weight ?? null;
  const delta   = latest !== null && prev !== null ? +(latest - prev).toFixed(1) : null;

  const logogged = !todayEntry;

  return (
    <div
      onClick={() => router.push('/weight')}
      style={{
        background: 'var(--bg-elev)', borderRadius: 14, padding: '14px 16px',
        border: logogged
          ? '1px solid color-mix(in srgb,var(--warn) 35%,transparent)'
          : '1px solid var(--line)',
        cursor: 'pointer', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: logogged ? 'color-mix(in srgb,var(--warn) 12%,transparent)' : 'color-mix(in srgb,var(--accent) 12%,transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>⚖️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {logogged ? '⏰ Pense à te peser !' : `${latest} kg aujourd'hui`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>
          {logogged
            ? latest ? `Dernière pesée : ${latest} kg` : 'Aucune pesée enregistrée'
            : delta !== null
              ? delta < 0 ? `▼ ${Math.abs(delta)} kg vs hier` : delta > 0 ? `▲ ${delta} kg vs hier` : 'Stable vs hier'
              : 'Voir la courbe →'
          }
        </div>
      </div>
      {delta !== null && !logogged && (
        <div style={{ fontSize: 15, fontWeight: 800, color: delta < 0 ? '#22c55e' : delta > 0 ? 'var(--warn)' : 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {delta > 0 ? '+' : ''}{delta}
        </div>
      )}
    </div>
  );
}

// ─── Widget Jeûne ─────────────────────────────────────────────────────────────

function FastingWidget() {
  const router = useRouter();
  const { fastingSessions } = useStore();
  const [, setTick] = useState(0);

  const activeFast = fastingSessions.find((f) => !f.endTime) ?? null;

  useEffect(() => {
    if (!activeFast) return;
    const iv = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(iv);
  }, [activeFast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeFast) {
    return (
      <div
        onClick={() => router.push('/fasting')}
        style={{
          background: 'var(--bg-elev)', borderRadius: 14, padding: '14px 16px', marginBottom: 12,
          border: '1px solid var(--line)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'color-mix(in srgb,var(--accent) 12%,transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Jeûne intermittent</div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 1 }}>Aucun jeûne en cours · Démarrer →</div>
        </div>
      </div>
    );
  }

  const elapsedMs = Date.now() - new Date(activeFast.startTime).getTime();
  const targetMs  = activeFast.targetHours * 3_600_000;
  const progress  = Math.min(elapsedMs / targetMs, 1);
  const done      = elapsedMs >= targetMs;

  const fmtHMS = (ms: number) => {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const accent = done ? '#22c55e' : 'var(--accent)';

  return (
    <div onClick={() => router.push('/fasting')} style={{ marginBottom: 12, cursor: 'pointer' }}>
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 14,
        border: `1px solid ${done ? 'color-mix(in srgb,#22c55e 35%,transparent)' : 'color-mix(in srgb,var(--accent) 25%,transparent)'}`,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: done ? 'color-mix(in srgb,#22c55e 12%,transparent)' : 'color-mix(in srgb,var(--accent) 12%,transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {done ? '🎉' : '🔥'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>
              {done ? 'Objectif atteint !' : 'Jeûne en cours'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
              {done ? `${activeFast.targetHours}h complétés` : `Objectif ${activeFast.targetHours}h`}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', fontSize: 18, fontWeight: 800, color: accent }}>
            {fmtHMS(elapsedMs)}
          </div>
        </div>
        <div style={{ height: 5, background: 'var(--bg-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${progress * 100}%`, background: accent, transition: 'width 1s linear' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { showToast } = useShell();
  const { matches, upcoming, weightEntries, fastingSessions, user } = useStore();

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const wins    = matches.filter((m) => m.result === 'win').length;
  const losses  = matches.filter((m) => m.result === 'loss').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;

  const { current: fastStreak } = fastingStreaks(fastingSessions);

  const nextMatch = upcoming[0];

  // Remind to weigh if not done today
  const todayStr = today.toISOString().slice(0, 10);
  const weighedToday = weightEntries.some((w) => w.date === todayStr);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">{dateStr}</div>
          <h1 className="page-title">Bonjour{user.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
          <div className="page-sub">Ton tableau de bord santé</div>
        </div>
      </div>

      {/* ── Habitudes du jour ── */}
      <div className="section-head" style={{ marginBottom: 10 }}>
        <h2 className="section-title">Habitudes du jour</h2>
        {!weighedToday && (
          <span style={{ fontSize: 11, background: 'color-mix(in srgb,var(--warn) 15%,transparent)', color: 'var(--warn)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
            ⏰ Pesée manquante
          </span>
        )}
      </div>

      <WeightWidget />
      <FastingWidget />

      {/* ── KPIs santé ── */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi" onClick={() => router.push('/weight')} style={{ cursor: 'pointer' }}>
          <div className="label">Pesées</div>
          <div className="value">{weightEntries.length}</div>
          <div className="delta">{weighedToday ? '✓ Fait aujourd\'hui' : '⏰ Pas encore'}</div>
        </div>
        <div className="kpi" onClick={() => router.push('/fasting')} style={{ cursor: 'pointer' }}>
          <div className="label">Jeûnes</div>
          <div className="value">{fastingSessions.filter((f) => f.completed).length}</div>
          <div className="delta">{fastStreak > 0 ? `🔥 ${fastStreak}j d'affilée` : 'complétés'}</div>
        </div>
        <div className="kpi" onClick={() => router.push('/padel')} style={{ cursor: 'pointer' }}>
          <div className="label">Matchs</div>
          <div className="value">{matches.length}</div>
          <div className="delta">{winRate !== null ? `${winRate}% win rate` : 'joués'}</div>
        </div>
        <div className="kpi" onClick={() => router.push('/padel')} style={{ cursor: 'pointer' }}>
          <div className="label">Victoires</div>
          <div className="value">{wins}</div>
          <div className="delta">{losses > 0 ? `${losses} défaite${losses > 1 ? 's' : ''}` : 'en padel'}</div>
        </div>
      </div>

      {/* ── Prochain match ── */}
      {nextMatch && (
        <div className="section">
          <div className="section-head">
            <h2 className="section-title">Prochain match</h2>
            <button className="section-link" onClick={() => router.push('/padel')}>
              Tout voir →
            </button>
          </div>
          <div
            className="card"
            style={{ padding: '14px 16px', cursor: 'pointer' }}
            onClick={() => router.push('/padel')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'color-mix(in srgb,#7c6fcd 12%,transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="calendar" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {new Date(nextMatch.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {nextMatch.time}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                  {nextMatch.venue} · Court {nextMatch.court}
                  {nextMatch.partners ? ` · avec ${nextMatch.partners}` : ''}
                </div>
              </div>
              <Icon name="racket" size={16} />
            </div>
          </div>
        </div>
      )}

      {/* ── Accès rapide Padel ── */}
      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Padel</h2>
          <button className="section-link" onClick={() => router.push('/padel')}>
            Voir tout →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Analyse vidéo', icon: 'video' as const, href: '/analyse', desc: 'Stats en temps réel' },
            { label: 'Agenda', icon: 'calendar' as const, href: '/calendar', desc: `${upcoming.length} match${upcoming.length !== 1 ? 's' : ''} planifié${upcoming.length !== 1 ? 's' : ''}` },
          ].map((s) => (
            <div
              key={s.href}
              onClick={() => router.push(s.href)}
              style={{ background: 'var(--bg-elev)', borderRadius: 14, border: '1px solid var(--line)', padding: '14px', cursor: 'pointer' }}
              onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(.97)')}
              onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Icon name={s.icon} size={18} />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
