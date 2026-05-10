'use client';

import { Icon } from '@/components/Icon';
import { Donut } from '@/components/Donut';
import { useStore } from '@/lib/store';

export default function StatsPage() {
  const { matches, user } = useStore();

  const totalHours = matches.reduce((s, m) => s + m.duration, 0);
  const wins = matches.filter((m) => m.result === 'win').length;
  const losses = matches.filter((m) => m.result === 'loss').length;
  const lessons = matches.filter((m) => m.result === 'lesson').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const monthly = [12, 18, 22, 28, 32];
  const monthLabels = ['jan', 'fév', 'mar', 'avr', 'mai'];
  const max = Math.max(...monthly);

  const shotData = [
    { label: 'Coup droit', value: 32, color: 'var(--accent)' },
    { label: 'Revers', value: 24, color: 'var(--accent-2)' },
    { label: 'Volée', value: 22, color: 'color-mix(in srgb, var(--accent) 60%, var(--bg-soft))' },
    { label: 'Smash / bandeja', value: 12, color: 'color-mix(in srgb, var(--accent) 30%, var(--bg-soft))' },
    { label: 'Lob', value: 10, color: 'var(--bg-soft)' },
  ];

  const partners = [
    { name: 'Jules Renard', count: 14, win: 71 },
    { name: 'Léa Costa', count: 9, win: 55 },
    { name: 'Sam Bouvier', count: 7, win: 86 },
    { name: 'Coach Pablo', count: 5, win: null },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Statistiques</div>
          <h1 className="page-title">Ta progression</h1>
          <div className="page-sub">
            Niveau {user.level} · Plus qu&apos;un cran avant le niveau 8
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between">
          <div>
            <div className="eyebrow">Niveau actuel</div>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4 }}>
              <span className="num">{user.level}</span>{' '}
              <span style={{ color: 'var(--ink-faint)', fontSize: 18 }}>/ 8 · 62%</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
              Estimation basée sur tes derniers 12 matchs
            </div>
          </div>
          <Icon name="trophy" size={32} />
        </div>
        <div className="level-bar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`level-pip ${i < user.level - 1 ? 'on' : ''} ${i === user.level - 1 ? 'current' : ''}`}
              style={i === user.level - 1 ? ({ '--p': '62%' } as React.CSSProperties) : {}}
            />
          ))}
        </div>
      </div>

      <div className="stats-grid mt-16">
        <div className="card">
          <div className="eyebrow">Bilan global</div>
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
            {[
              { label: 'Victoires', value: wins },
              { label: 'Défaites', value: losses },
              { label: 'Cours', value: lessons },
              { label: 'Win rate', value: `${winRate}%` },
            ].map((k) => (
              <div key={k.label} className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                <div className="label">{k.label}</div>
                <div className="value">{k.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Volume mensuel</div>
          <div className="bar-chart" style={{ marginTop: 16 }}>
            {monthly.map((v, i) => (
              <div
                key={i}
                className={`bar ${i === monthly.length - 1 ? 'active' : ''}`}
                style={{ height: `${(v / max) * 100}%` }}
              >
                <span className="bar-value num">{v}h</span>
                <span className="bar-label">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Donut data={shotData} />
          <div className="legend">
            <div className="eyebrow">Répartition coups</div>
            {shotData.map((d) => (
              <div key={d.label} className="row">
                <span className="swatch" style={{ background: d.color }} />
                <span>{d.label}</span>
                <span className="num">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Partenaires fréquents</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {partners.map((p) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                  {p.name.split(' ').map((s) => s[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.count} matchs{p.win !== null ? ` · ${p.win}% win` : ''}
                  </div>
                </div>
                <div className="num" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {p.count}×
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
