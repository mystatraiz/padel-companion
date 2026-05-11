'use client';

import { useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Team = 'own' | 'opp';
type StatType = 'smash' | 'coup-droit' | 'revers' | 'faute-directe' | 'faute-provoquee' | 'winner';

interface StatEvent {
  id: number;
  time: number;
  team: Team;
  type: StatType;
}

const STAT_LABELS: Record<StatType, string> = {
  'smash':           'Smash',
  'coup-droit':      'Coup droit',
  'revers':          'Revers',
  'faute-directe':   'Faute directe',
  'faute-provoquee': 'Faute provoquée',
  'winner':          'Winner',
};

// ─── Utils ────────────────────────────────────────────────────────────────────

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// ─── Stat panel for one team ──────────────────────────────────────────────────

function TeamPanel({ label, color, onStat }: {
  label: string;
  color: string;
  onStat: (type: StatType) => void;
}) {
  const btn = (type: StatType, flex = 1, style?: React.CSSProperties) => (
    <button
      onClick={() => onStat(type)}
      style={{
        flex,
        padding: '12px 6px',
        border: 'none',
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
        letterSpacing: '-0.01em',
        transition: 'transform .08s, opacity .1s',
        ...style,
      }}
      onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(.94)'; }}
      onPointerUp={(e)   => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
    >
      {STAT_LABELS[type]}
    </button>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Team label */}
      <div style={{
        textAlign: 'center', fontSize: 11, fontWeight: 700,
        letterSpacing: '.1em', textTransform: 'uppercase',
        color, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
        paddingBottom: 4, borderBottom: `2px solid ${color}`,
      }}>
        {label}
      </div>

      {/* Smash */}
      <div style={{ display: 'flex', gap: 6 }}>
        {btn('smash', 1, { background: 'var(--ink)', color: 'var(--bg-elev)', padding: '14px 6px', fontSize: 14 })}
      </div>

      {/* Coup droit + Revers */}
      <div style={{ display: 'flex', gap: 6 }}>
        {btn('coup-droit', 1, { background: 'var(--bg-soft)', color: 'var(--ink)' })}
        {btn('revers',     1, { background: 'var(--bg-soft)', color: 'var(--ink)' })}
      </div>

      {/* Faute directe + Faute provoquée */}
      <div style={{ display: 'flex', gap: 6 }}>
        {btn('faute-directe',   1, { background: 'color-mix(in srgb, var(--warn) 15%, transparent)', color: 'var(--warn)', border: '1px solid color-mix(in srgb, var(--warn) 30%, transparent)' })}
        {btn('faute-provoquee', 1, { background: 'color-mix(in srgb, var(--warn) 15%, transparent)', color: 'var(--warn)', border: '1px solid color-mix(in srgb, var(--warn) 30%, transparent)', fontSize: 11 })}
      </div>

      {/* Winner */}
      <div style={{ display: 'flex', gap: 6 }}>
        {btn('winner', 1, {
          background: color, color: 'white',
          padding: '16px 6px', fontSize: 15, borderRadius: 14,
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalysePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const [videoSrc,    setVideoSrc]    = useState<string | null>(null);
  const [events,      setEvents]      = useState<StatEvent[]>([]);
  const [pauseOnTap,  setPauseOnTap]  = useState(true);

  const logStat = useCallback((team: Team, type: StatType) => {
    const time = videoRef.current?.currentTime ?? 0;
    if (pauseOnTap) videoRef.current?.pause();
    setEvents((prev) => [{ id: Date.now(), time, team, type }, ...prev]);
  }, [pauseOnTap]);

  const undoLast = () => setEvents((prev) => prev.slice(1));
  const clearAll = () => { if (window.confirm('Effacer tous les événements ?')) setEvents([]); };

  // Totals
  const total = (team: Team, type?: StatType) =>
    events.filter((e) => e.team === team && (!type || e.type === type)).length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Analyse</div>
          <h1 className="page-title">Vidéo · Stats temps réel</h1>
        </div>
      </div>

      {/* ── Video player ── */}
      <div style={{
        background: 'var(--ink)', borderRadius: 16, overflow: 'hidden',
        marginBottom: 16, position: 'relative',
        minHeight: videoSrc ? 0 : 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            playsInline
            style={{ width: '100%', maxHeight: '38vh', display: 'block' }}
          />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: 'none', border: '2px dashed rgba(255,255,255,.25)',
              borderRadius: 14, color: 'rgba(255,255,255,.6)',
              padding: '24px 40px', cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
              fontWeight: 500, margin: 12,
            }}
          >
            📹 Charger une vidéo depuis la galerie
          </button>
        )}
        {videoSrc && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: 8,
              color: 'white', fontSize: 11, padding: '5px 10px', cursor: 'pointer',
            }}
          >
            Changer
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setVideoSrc(URL.createObjectURL(file));
          }}
        />
      </div>

      {/* ── Option pause ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: 8, marginBottom: 14,
      }}>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Pause au tap</span>
        <div
          onClick={() => setPauseOnTap((v) => !v)}
          style={{
            width: 38, height: 22, borderRadius: 999,
            background: pauseOnTap ? 'var(--accent)' : 'var(--line)',
            position: 'relative', cursor: 'pointer', transition: 'background .15s',
          }}
        >
          <div style={{
            position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left .15s',
            left: pauseOnTap ? 18 : 2,
          }} />
        </div>
      </div>

      {/* ── Stats panels ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <TeamPanel
          label="Mon équipe"
          color="var(--accent)"
          onStat={(type) => logStat('own', type)}
        />
        <div style={{ width: 1, background: 'var(--line)', flexShrink: 0 }} />
        <TeamPanel
          label="Adversaires"
          color="var(--warn)"
          onStat={(type) => logStat('opp', type)}
        />
      </div>

      {/* ── Score résumé ── */}
      {events.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          gap: 8, marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 12, padding: '10px 8px', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{total('own')}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Mon équipe</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
              {total('own', 'winner')}W · {total('own', 'smash')}S
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, fontWeight: 700, color: 'var(--ink-faint)' }}>VS</div>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 12, padding: '10px 8px', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--warn)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{total('opp')}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Adversaires</div>
            <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>
              {total('opp', 'winner')}W · {total('opp', 'smash')}S
            </div>
          </div>
        </div>
      )}

      {/* ── Log ── */}
      {events.length > 0 && (
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--line)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {events.length} événement{events.length > 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={undoLast} style={smallBtn}>↩ Annuler</button>
              <button onClick={clearAll} style={{ ...smallBtn, color: 'var(--warn)' }}>Tout effacer</button>
            </div>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {events.map((e) => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', borderBottom: '1px solid var(--line)',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)',
                  fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
                  minWidth: 36,
                }}>
                  {fmt(e.time)}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: e.team === 'own' ? 'var(--accent)' : 'var(--warn)',
                  minWidth: 80,
                }}>
                  {e.team === 'own' ? 'Mon équipe' : 'Adv.'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                  {STAT_LABELS[e.type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && videoSrc && (
        <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, padding: '24px 0' }}>
          Lance la vidéo et tape les boutons pour enregistrer
        </div>
      )}
    </>
  );
}

const smallBtn: React.CSSProperties = {
  background: 'var(--bg-soft)', border: 'none', borderRadius: 8,
  padding: '5px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  color: 'var(--ink-soft)', fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
};
