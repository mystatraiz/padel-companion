'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Icon } from '@/components/Icon';
import type { WeightEntry } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = () => new Date().toISOString().slice(0, 10);

function dayLabel(date: string) {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function trend(entries: WeightEntry[], days: number): number | null {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length < 2) return null;
  const recent = sorted[0].weight;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const old = sorted.find((e) => new Date(e.date) <= cutoff);
  if (!old) return null;
  return +(recent - old.weight).toFixed(1);
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function WeightChart({ entries, days }: { entries: WeightEntry[]; days: number }) {
  const sorted = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);

  if (sorted.length < 2) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
        Ajoute au moins 2 pesées pour voir la courbe
      </div>
    );
  }

  const W = 600, H = 160;
  const PAD = { top: 16, bottom: 28, left: 36, right: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const cx = (i: number) => PAD.left + (i / (sorted.length - 1)) * innerW;
  const cy = (w: number) => PAD.top + (1 - (w - minW) / range) * innerH;

  const linePts = sorted.map((e, i) => `${cx(i)},${cy(e.weight)}`).join(' ');
  const areaPath = [
    `M ${cx(0)},${cy(sorted[0].weight)}`,
    ...sorted.slice(1).map((e, i) => `L ${cx(i + 1)},${cy(e.weight)}`),
    `L ${cx(sorted.length - 1)},${H - PAD.bottom}`,
    `L ${cx(0)},${H - PAD.bottom} Z`,
  ].join(' ');

  // X-axis labels : afficher max 5 labels
  const labelStep = Math.max(1, Math.floor(sorted.length / 5));
  const xLabels = sorted.filter((_, i) => i === 0 || i === sorted.length - 1 || i % labelStep === 0);

  // Y-axis : 3 lignes horizontales
  const yTicks = [minW, (minW + maxW) / 2, maxW].map((v) => +v.toFixed(1));

  const today = TODAY();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={cy(v)} x2={W - PAD.right} y2={cy(v)}
            stroke="var(--line)" strokeWidth={1} />
          <text x={PAD.left - 4} y={cy(v) + 4} textAnchor="end"
            fontSize={9} fill="var(--ink-faint)" fontFamily="JetBrains Mono, monospace">
            {v}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#wGrad)" />

      {/* Line */}
      <polyline fill="none" stroke="var(--accent)" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" points={linePts} />

      {/* Points */}
      {sorted.map((e, i) => (
        <circle key={e.id}
          cx={cx(i)} cy={cy(e.weight)} r={e.date === today ? 5 : 3}
          fill={e.date === today ? 'var(--accent)' : 'var(--bg-elev)'}
          stroke="var(--accent)" strokeWidth={2}
        />
      ))}

      {/* X labels */}
      {sorted.map((e, i) => {
        const show = i === 0 || i === sorted.length - 1 || (sorted.length > 5 && i % labelStep === 0);
        if (!show) return null;
        return (
          <text key={e.id} x={cx(i)} y={H - 4} textAnchor="middle"
            fontSize={9} fill="var(--ink-faint)" fontFamily="JetBrains Mono, monospace">
            {dayLabel(e.date)}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WeightPage() {
  const { weightEntries, logWeight, deleteWeight } = useStore();

  const today     = TODAY();
  const todayEntry = weightEntries.find((w) => w.date === today);

  const sorted    = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
  const latest    = sorted[0]?.weight ?? null;
  const prev      = sorted[1]?.weight ?? null;
  const delta7    = trend(weightEntries, 7);
  const delta30   = trend(weightEntries, 30);

  const [input,   setInput]   = useState(todayEntry ? String(todayEntry.weight) : '');
  const [range,   setRange]   = useState<30 | 90 | 365>(30);
  const [saved,   setSaved]   = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);

  const handleLog = () => {
    const val = parseFloat(input.replace(',', '.'));
    if (isNaN(val) || val < 20 || val > 300) return;
    logWeight(+val.toFixed(1));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deltaColor = (d: number | null) =>
    d === null ? 'var(--ink-faint)' : d < 0 ? '#22c55e' : d > 0 ? 'var(--warn)' : 'var(--ink-soft)';

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Santé</div>
          <h1 className="page-title">Suivi du poids</h1>
          {latest && (
            <div className="page-sub">
              Dernier relevé : <b>{latest} kg</b>
              {prev && ` · ${latest > prev ? '▲' : latest < prev ? '▼' : '='} ${Math.abs(+(latest - prev).toFixed(1))} kg`}
            </div>
          )}
        </div>
      </div>

      {/* ── Saisie du jour ── */}
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 20, border: `1px solid ${todayEntry && !saved ? 'color-mix(in srgb,var(--accent) 30%,transparent)' : 'var(--line)'}`,
        padding: '20px 20px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 12 }}>
          {todayEntry ? (saved ? '✓ Enregistré !' : `Aujourd'hui · modifiable`) : `Ton poids aujourd'hui`}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={input}
              onChange={(e) => { setInput(e.target.value); setSaved(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLog()}
              placeholder={latest ? String(latest) : '75.0'}
              style={{
                width: '100%', padding: '14px 48px 14px 16px', borderRadius: 14,
                border: '1.5px solid var(--line)', background: 'var(--bg-soft)',
                color: 'var(--ink)', fontSize: 28, fontWeight: 800,
                fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
                letterSpacing: '-0.02em', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, fontWeight: 600, color: 'var(--ink-faint)',
            }}>kg</span>
          </div>
          <button
            onClick={handleLog}
            style={{
              padding: '14px 22px', borderRadius: 14, border: 'none',
              background: saved ? '#22c55e' : 'var(--accent)', color: 'white',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              transition: 'background .2s',
            }}
          >
            {saved ? '✓' : 'Enregistrer'}
          </button>
        </div>

        {/* Reminder si pas pesé aujourd'hui */}
        {!todayEntry && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⏰</span> Pense à te peser le matin, à jeun, pour plus de précision
          </div>
        )}
      </div>

      {/* ── Stats rapides ── */}
      {weightEntries.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Actuel',    value: latest ? `${latest} kg` : '—', color: 'var(--ink)' },
            { label: '7 derniers jours', value: delta7 !== null ? `${delta7 > 0 ? '+' : ''}${delta7} kg` : '—', color: deltaColor(delta7) },
            { label: '30 derniers jours', value: delta30 !== null ? `${delta30 > 0 ? '+' : ''}${delta30} kg` : '—', color: deltaColor(delta30) },
          ].map((k) => (
            <div key={k.label} style={{ background: 'var(--bg-elev)', borderRadius: 14, padding: '12px 14px', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.color, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Courbe ── */}
      {weightEntries.length >= 2 && (
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', padding: '16px 14px 10px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Courbe de poids</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {([30, 90, 365] as const).map((d) => (
                <button key={d} onClick={() => setRange(d)} style={{
                  padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: range === d ? 'var(--accent)' : 'var(--bg-soft)',
                  color: range === d ? 'white' : 'var(--ink-faint)',
                }}>
                  {d === 365 ? '1an' : `${d}j`}
                </button>
              ))}
            </div>
          </div>
          <WeightChart entries={weightEntries} days={range} />
        </div>
      )}

      {/* ── Historique ── */}
      {sorted.length > 0 && (
        <>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h2 className="section-title">Historique</h2>
            <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{sorted.length} entrée{sorted.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
            {sorted.slice(0, 30).map((e, i) => {
              const next = sorted[i + 1];
              const diff = next ? +(e.weight - next.weight).toFixed(1) : null;
              const isToday = e.date === today;
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                  borderBottom: i < Math.min(sorted.length, 30) - 1 ? '1px solid var(--line)' : 'none',
                  background: isToday ? 'color-mix(in srgb,var(--accent) 5%,transparent)' : 'transparent',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {isToday ? "Aujourd'hui" : dayLabel(e.date)}
                      {isToday && <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--accent)', color: 'white', borderRadius: 4, padding: '1px 5px' }}>Aujourd'hui</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1 }}>{e.date}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', fontSize: 17, fontWeight: 700 }}>
                    {e.weight} <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>kg</span>
                  </div>
                  {diff !== null && (
                    <div style={{ fontSize: 12, fontWeight: 600, minWidth: 48, textAlign: 'right', color: diff < 0 ? '#22c55e' : diff > 0 ? 'var(--warn)' : 'var(--ink-faint)' }}>
                      {diff > 0 ? '+' : ''}{diff} kg
                    </div>
                  )}
                  <button
                    onClick={() => deleteWeight(e.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: 4, borderRadius: 6, opacity: 0.5, flexShrink: 0 }}
                    title="Supprimer"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {weightEntries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-faint)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Aucune pesée enregistrée</div>
          <div style={{ fontSize: 12 }}>Saisis ton poids ci-dessus pour commencer le suivi</div>
        </div>
      )}
    </>
  );
}
