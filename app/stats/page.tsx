'use client';

import { Icon } from '@/components/Icon';
import { Donut } from '@/components/Donut';
import { useStore, MONTHS_FR } from '@/lib/store';
import type { PlayerShotStats } from '@/lib/types';

const EMPTY_SHOTS: PlayerShotStats = { smash: 0, coupDroit: 0, revers: 0, fauteDirecte: 0, fauteProvoquee: 0, winner: 0 };

function addShots(a: PlayerShotStats, b: PlayerShotStats): PlayerShotStats {
  return {
    smash:          a.smash          + b.smash,
    coupDroit:      a.coupDroit      + b.coupDroit,
    revers:         a.revers         + b.revers,
    fauteDirecte:   a.fauteDirecte   + b.fauteDirecte,
    fauteProvoquee: a.fauteProvoquee + b.fauteProvoquee,
    winner:         a.winner         + b.winner,
  };
}

export default function StatsPage() {
  const { matches, user } = useStore();

  // ── Bilan global ──────────────────────────────────────────────
  const totalHours = matches.reduce((s, m) => s + m.duration, 0);
  const wins    = matches.filter((m) => m.result === 'win').length;
  const losses  = matches.filter((m) => m.result === 'loss').length;
  const lessons = matches.filter((m) => m.result === 'lesson').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  // ── Volume mensuel (6 derniers mois) ─────────────────────────
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const hours = matches
      .filter((m) => m.date.startsWith(key))
      .reduce((s, m) => s + m.duration, 0);
    return { label: MONTHS_FR[d.getMonth()], hours };
  });
  const maxH = Math.max(...monthlyData.map((d) => d.hours), 1);

  // ── Stats d'analyse ───────────────────────────────────────────
  const analyzedMatches = matches.filter((m) => m.stats);
  const totals = analyzedMatches.reduce(
    (acc, m) => addShots(acc, m.stats!.total),
    { ...EMPTY_SHOTS },
  );
  const totalShots = Object.values(totals).reduce((a, b) => a + b, 0);
  const pct = (n: number) => totalShots > 0 ? Math.round((n / totalShots) * 100) : 0;

  const shotData = [
    { label: 'Coup droit',      value: totals.coupDroit,      color: 'var(--accent)' },
    { label: 'Revers',          value: totals.revers,          color: '#7c6fcd' },
    { label: 'Smash',           value: totals.smash,           color: 'color-mix(in srgb,var(--accent) 55%,var(--bg-soft))' },
    { label: 'Winner',          value: totals.winner,          color: 'color-mix(in srgb,var(--accent) 85%,white)' },
    { label: 'Faute directe',   value: totals.fauteDirecte,   color: 'color-mix(in srgb,var(--warn) 65%,var(--bg-soft))' },
    { label: 'Faute provoquée', value: totals.fauteProvoquee, color: 'color-mix(in srgb,var(--warn) 35%,var(--bg-soft))' },
  ];

  // ── Partenaires réels ─────────────────────────────────────────
  const partnerMap: Record<string, { count: number; wins: number }> = {};
  matches.forEach((m) => {
    if (!m.partners) return;
    if (!partnerMap[m.partners]) partnerMap[m.partners] = { count: 0, wins: 0 };
    partnerMap[m.partners].count++;
    if (m.result === 'win') partnerMap[m.partners].wins++;
  });
  const partners = Object.entries(partnerMap)
    .map(([name, { count, wins: w }]) => ({
      name, count, win: count > 0 ? Math.round((w / count) * 100) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Statistiques</div>
          <h1 className="page-title">Ta progression</h1>
          <div className="page-sub">
            Niveau {user.level} · {matches.length} match{matches.length !== 1 ? 's' : ''} · {totalHours.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Niveau */}
      <div className="card">
        <div className="flex-between">
          <div>
            <div className="eyebrow">Niveau actuel</div>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4 }}>
              <span className="num">{user.level}</span>{' '}
              <span style={{ color: 'var(--ink-faint)', fontSize: 18 }}>/ 8</span>
            </div>
          </div>
          <Icon name="trophy" size={32} />
        </div>
        <div className="level-bar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`level-pip ${i < user.level - 1 ? 'on' : ''} ${i === user.level - 1 ? 'current' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="stats-grid mt-16">
        {/* Bilan global */}
        <div className="card">
          <div className="eyebrow">Bilan global</div>
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
            {[
              { label: 'Victoires',  value: wins },
              { label: 'Défaites',   value: losses },
              { label: 'Cours',      value: lessons },
              { label: 'Win rate',   value: wins + losses > 0 ? `${winRate}%` : '—' },
            ].map((k) => (
              <div key={k.label} className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                <div className="label">{k.label}</div>
                <div className="value">{k.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume mensuel */}
        <div className="card">
          <div className="eyebrow">Volume mensuel</div>
          <div className="bar-chart" style={{ marginTop: 16 }}>
            {monthlyData.map((d, i) => (
              <div
                key={i}
                className={`bar ${i === monthlyData.length - 1 ? 'active' : ''}`}
                style={{ height: `${(d.hours / maxH) * 100}%` }}
              >
                <span className="bar-value num">{d.hours > 0 ? `${d.hours.toFixed(0)}h` : ''}</span>
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition coups */}
        <div className="card" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          {totalShots > 0 ? (
            <>
              <Donut data={shotData} />
              <div className="legend">
                <div className="eyebrow">Répartition coups</div>
                {shotData.filter((d) => d.value > 0).map((d) => (
                  <div key={d.label} className="row">
                    <span className="swatch" style={{ background: d.color }} />
                    <span>{d.label}</span>
                    <span className="num">{pct(d.value)}%</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 6 }}>
                  {totalShots} coups · {analyzedMatches.length} match{analyzedMatches.length !== 1 ? 's' : ''} analysé{analyzedMatches.length !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📹</div>
              <div className="eyebrow">Répartition coups</div>
              <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 6, lineHeight: 1.5 }}>
                Analyse une vidéo pour voir<br />ta répartition de coups
              </div>
            </div>
          )}
        </div>

        {/* Partenaires */}
        <div className="card">
          <div className="eyebrow">Partenaires fréquents</div>
          {partners.length > 0 ? (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {partners.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                    {p.name.split(' ').map((s) => s[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {p.count} match{p.count !== 1 ? 's' : ''}{p.win !== null ? ` · ${p.win}% win` : ''}
                    </div>
                  </div>
                  <div className="num" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.count}×</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 10 }}>
              Ajoute des matchs pour voir tes partenaires fréquents
            </div>
          )}
        </div>
      </div>

      {/* ── Matchs analysés ── */}
      {analyzedMatches.length > 0 && (
        <div className="section" style={{ marginTop: 24 }}>
          <div className="section-head">
            <h2 className="section-title">Détail par match analysé</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analyzedMatches.slice(0, 5).map((m) => {
              const s = m.stats!.total;
              const won = m.result === 'win';
              return (
                <div key={m.id} style={{ background: 'var(--bg-elev)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--line)' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        vs {m.opponents || 'Adversaires'}{m.partners ? ` — avec ${m.partners}` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                        {m.date} · {m.score || '—'}{m.venue ? ` · ${m.venue}` : ''}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: won
                        ? 'color-mix(in srgb,var(--accent) 15%,transparent)'
                        : 'color-mix(in srgb,var(--warn) 15%,transparent)',
                      color: won ? 'var(--accent)' : 'var(--warn)',
                    }}>
                      {won ? 'Victoire' : 'Défaite'}
                    </span>
                  </div>

                  {/* Shots grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 0', fontSize: 12 }}>
                    {([
                      ['Smash',           s.smash],
                      ['Coup droit',      s.coupDroit],
                      ['Revers',          s.revers],
                      ['Winner',          s.winner],
                      ['Faute directe',   s.fauteDirecte],
                      ['Faute provoquée', s.fauteProvoquee],
                    ] as [string, number][]).map(([lbl, val]) =>
                      val > 0 ? (
                        <div key={lbl} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <span style={{ color: 'var(--ink-faint)' }}>{lbl}</span>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{val}</span>
                        </div>
                      ) : null
                    )}
                  </div>

                  {/* Per-player breakdown */}
                  {(m.stats!.leftPlayer.coupDroit + m.stats!.rightPlayer.coupDroit > 0 ||
                    m.stats!.leftPlayer.smash     + m.stats!.rightPlayer.smash > 0) && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                      {(['leftPlayer', 'rightPlayer'] as const).map((p) => {
                        const ps = m.stats![p];
                        const tot = Object.values(ps).reduce((a, b) => a + b, 0);
                        if (!tot) return null;
                        return (
                          <div key={p} style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: p === 'leftPlayer' ? 'var(--accent)' : '#7c6fcd', marginBottom: 3 }}>
                              {p === 'leftPlayer' ? 'J. Gauche' : 'J. Droit'} · {tot} coups
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                              CD {ps.coupDroit} · Rev {ps.revers} · Sm {ps.smash} · Win {ps.winner}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
