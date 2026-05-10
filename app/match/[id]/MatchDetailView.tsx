'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { RacketSVG } from '@/components/RacketSVG';
import { ShoeSVG } from '@/components/ShoeSVG';
import { useStore, wearClass, wearPct } from '@/lib/store';

export function MatchDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { matches, equipment, user } = useStore();
  const m = matches.find((x) => x.id === id);

  if (!m) {
    return (
      <div>
        Match introuvable.{' '}
        <button className="btn" onClick={() => router.push('/calendar')}>
          Retour
        </button>
      </div>
    );
  }

  const racket = equipment.find((e) => e.id === m.racket);
  const shoes = equipment.find((e) => e.id === m.shoes);
  const d = new Date(m.date);
  const isLesson = m.result === 'lesson';

  return (
    <>
      <button className="detail-back" onClick={() => router.push('/calendar')}>
        <Icon name="back" size={16} /> Calendrier
      </button>

      <div className="page-head">
        <div>
          <div className="eyebrow">
            {d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="page-title">
            {isLesson ? 'Cours technique' : m.result === 'win' ? 'Victoire' : 'Défaite'}
          </h1>
          <div className="page-sub">
            {m.venue} · Court {m.court} · {m.duration}h
          </div>
        </div>
        <span
          className={`match-score ${m.result === 'win' ? 'win' : m.result === 'loss' ? 'loss' : ''}`}
          style={{ fontSize: 18, padding: '10px 16px' }}
        >
          {m.score}
        </span>
      </div>

      <div className="hero">
        <div className="card">
          <div className="eyebrow">Composition</div>
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: isLesson ? '1fr' : '1fr auto 1fr',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  marginBottom: 6,
                }}
              >
                Toi & partenaire
              </div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>+ {m.partners}</div>
            </div>
            {!isLesson && (
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-faint)', fontSize: 18 }}>
                vs
              </div>
            )}
            {!isLesson && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-faint)',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    marginBottom: 6,
                  }}
                >
                  Adversaires
                </div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{m.opponents}</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Match</div>
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            <div className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <div className="label">Durée</div>
              <div className="value">
                {m.duration}
                <span className="unit">h</span>
              </div>
            </div>
            <div className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <div className="label">Calories</div>
              <div className="value">{Math.round(m.duration * 580)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Matériel utilisé</h2>
        </div>
        <div className="equip-grid">
          {racket && (
            <div className="equip-card" onClick={() => router.push(`/equipment/${racket.id}`)}>
              <div className="equip-thumb">
                <RacketSVG />
              </div>
              <div className="equip-body">
                <div className="equip-name">
                  {racket.brand} {racket.name}
                </div>
                <div className="equip-meta">
                  {racket.weight}g · {racket.shape}
                </div>
                <div className="wear-bar">
                  <div
                    className={`wear-fill ${wearClass(racket)}`}
                    style={{ width: `${wearPct(racket)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          {shoes && (
            <div className="equip-card" onClick={() => router.push(`/equipment/${shoes.id}`)}>
              <div className="equip-thumb">
                <ShoeSVG />
              </div>
              <div className="equip-body">
                <div className="equip-name">
                  {shoes.brand} {shoes.name}
                </div>
                <div className="equip-meta">Taille {shoes.size}</div>
                <div className="wear-bar">
                  <div
                    className={`wear-fill ${wearClass(shoes)}`}
                    style={{ width: `${wearPct(shoes)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
