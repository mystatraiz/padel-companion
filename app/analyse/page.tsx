'use client';

import { useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Team     = 'own' | 'opp';
type StatType = 'smash' | 'coup-droit' | 'revers' | 'faute-directe' | 'faute-provoquee' | 'winner';

interface StatEvent {
  id:        number;
  time:      number;
  team:      Team;
  type:      StatType;
  awardedTo: Team | null; // qui a gagné le point grâce à ce coup
}

interface Score {
  ownPts:     number;
  oppPts:     number;
  ownGames:   number;
  oppGames:   number;
  ownSets:    number;
  oppSets:    number;
  setHistory: [number, number][];
}

const INIT_SCORE: Score = {
  ownPts: 0, oppPts: 0,
  ownGames: 0, oppGames: 0,
  ownSets: 0, oppSets: 0,
  setHistory: [],
};

const STAT_LABELS: Record<StatType, string> = {
  'smash':           'Smash',
  'coup-droit':      'Coup droit',
  'revers':          'Revers',
  'faute-directe':   'Faute directe',
  'faute-provoquee': 'Faute provoquée',
  'winner':          'Winner',
};

// ─── Scoring logic ────────────────────────────────────────────────────────────

/** Qui gagne le point selon le type de coup et l'équipe qui l'a joué */
function pointWinner(team: Team, type: StatType): Team | null {
  if (type === 'winner')          return team;
  if (type === 'faute-provoquee') return team;           // on a provoqué → on gagne
  if (type === 'faute-directe')   return team === 'own' ? 'opp' : 'own'; // faute = point adverse
  return null; // smash, coup-droit, revers → pas de point automatique
}

function displayPoints(ownPts: number, oppPts: number): [string, string] {
  const PTS = ['0', '15', '30', '40'];
  const deuce = ownPts >= 3 && oppPts >= 3;
  if (!deuce) return [PTS[Math.min(ownPts, 3)], PTS[Math.min(oppPts, 3)]];
  if (ownPts === oppPts) return ['40', '40'];
  return ownPts > oppPts ? ['Ad', '—'] : ['—', 'Ad'];
}

function awardGame(s: Score, winner: Team): Score {
  const og = winner === 'own' ? s.ownGames + 1 : s.ownGames;
  const pg = winner === 'opp' ? s.oppGames + 1 : s.oppGames;
  const base = { ...s, ownPts: 0, oppPts: 0, ownGames: og, oppGames: pg };

  const setWon = (w: Team) => {
    const g: [number, number] = w === 'own' ? [og, pg] : [og, pg];
    return {
      ...base,
      ownGames: 0, oppGames: 0,
      ownSets: w === 'own' ? s.ownSets + 1 : s.ownSets,
      oppSets: w === 'opp' ? s.oppSets + 1 : s.oppSets,
      setHistory: [...s.setHistory, g],
    };
  };

  if (og >= 6 && og - pg >= 2) return setWon('own');
  if (og === 7 && pg === 6)    return setWon('own');
  if (pg >= 6 && pg - og >= 2) return setWon('opp');
  if (pg === 7 && og === 6)    return setWon('opp');
  return base;
}

function awardPoint(s: Score, winner: Team): Score {
  const op = winner === 'own' ? s.ownPts + 1 : s.ownPts;
  const pp = winner === 'opp' ? s.oppPts + 1 : s.oppPts;
  // Jeu gagné : 4 pts et 2 d'écart (ou avantage converti)
  if (op >= 4 && op - pp >= 2) return awardGame({ ...s, ownPts: 0, oppPts: 0 }, 'own');
  if (pp >= 4 && pp - op >= 2) return awardGame({ ...s, ownPts: 0, oppPts: 0 }, 'opp');
  return { ...s, ownPts: op, oppPts: pp };
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function Scoreboard({ score, ownLabel, oppLabel }: {
  score: Score; ownLabel: string; oppLabel: string;
}) {
  const [ownPt, oppPt] = displayPoints(score.ownPts, score.oppPts);
  const deuce = score.ownPts >= 3 && score.oppPts >= 3 && score.ownPts === score.oppPts;

  const row = (label: string, sets: number, games: number, pts: string, accent: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {/* Team label */}
      <div style={{ width: 90, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
        {label}
      </div>
      {/* Set history */}
      {score.setHistory.map(([o, p], i) => (
        <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {label === ownLabel ? o : p}
        </div>
      ))}
      {/* Current set games */}
      <div style={{ width: 36, textAlign: 'center', fontSize: 22, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', marginLeft: score.setHistory.length ? 8 : 0 }}>
        {games}
      </div>
      {/* Current game points */}
      <div style={{ width: 44, textAlign: 'center', fontSize: 18, fontWeight: 700, color: pts === 'Ad' ? accent : 'var(--ink-soft)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', marginLeft: 12 }}>
        {pts}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)',
      padding: '14px 16px', marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
        <div style={{ width: 90 }} />
        {score.setHistory.map((_, i) => (
          <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em' }}>
            S{i + 1}
          </div>
        ))}
        <div style={{ width: 36, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em', marginLeft: score.setHistory.length ? 8 : 0 }}>
          Jeux
        </div>
        <div style={{ width: 44, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em', marginLeft: 12 }}>
          {deuce ? 'Deuce' : 'Pts'}
        </div>
      </div>
      {row(ownLabel, score.ownSets, score.ownGames, ownPt, 'var(--accent)')}
      <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }} />
      {row(oppLabel, score.oppSets, score.oppGames, oppPt, 'var(--warn)')}
    </div>
  );
}

// ─── Team panel ───────────────────────────────────────────────────────────────

function TeamPanel({ label, color, onStat }: {
  label: string; color: string; onStat: (type: StatType) => void;
}) {
  const Btn = ({ type, style }: { type: StatType; style?: React.CSSProperties }) => (
    <button
      onClick={() => onStat(type)}
      style={{
        flex: 1, padding: '13px 4px', border: 'none', borderRadius: 12,
        fontWeight: 700, fontSize: 12, cursor: 'pointer',
        fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
        letterSpacing: '-0.01em', transition: 'transform .08s',
        ...style,
      }}
      onPointerDown={(e)  => { (e.currentTarget as HTMLElement).style.transform = 'scale(.93)'; }}
      onPointerUp={(e)    => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
    >
      {STAT_LABELS[type]}
    </button>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{
        textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
        textTransform: 'uppercase', color,
        fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
        paddingBottom: 6, borderBottom: `2px solid ${color}`,
      }}>{label}</div>

      {/* Smash */}
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type="smash" style={{ background: 'var(--ink)', color: 'var(--bg-elev)', padding: '15px 4px', fontSize: 13 }} />
      </div>

      {/* CD + Revers */}
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type="coup-droit" style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }} />
        <Btn type="revers"     style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }} />
      </div>

      {/* Fautes */}
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type="faute-directe"   style={{ background: `color-mix(in srgb, var(--warn) 12%, transparent)`, color: 'var(--warn)', border: `1px solid color-mix(in srgb, var(--warn) 25%, transparent)`, fontSize: 11 }} />
        <Btn type="faute-provoquee" style={{ background: `color-mix(in srgb, var(--warn) 12%, transparent)`, color: 'var(--warn)', border: `1px solid color-mix(in srgb, var(--warn) 25%, transparent)`, fontSize: 10 }} />
      </div>

      {/* Winner */}
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type="winner" style={{ background: color, color: 'white', padding: '16px 4px', fontSize: 14, borderRadius: 14 }} />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

export default function AnalysePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const [videoSrc,      setVideoSrc]      = useState<string | null>(null);
  const [events,        setEvents]        = useState<StatEvent[]>([]);
  const [scoreHistory,  setScoreHistory]  = useState<Score[]>([INIT_SCORE]);
  const [pauseOnTap,    setPauseOnTap]    = useState(true);

  const currentScore = scoreHistory[scoreHistory.length - 1];

  const logStat = useCallback((team: Team, type: StatType) => {
    const time = videoRef.current?.currentTime ?? 0;
    if (pauseOnTap) videoRef.current?.pause();

    const winner = pointWinner(team, type);
    const newScore = winner ? awardPoint(currentScore, winner) : currentScore;

    setEvents((prev) => [{ id: Date.now(), time, team, type, awardedTo: winner }, ...prev]);
    if (winner) setScoreHistory((prev) => [...prev, newScore]);
  }, [pauseOnTap, currentScore]);

  const undoLast = () => {
    if (!events.length) return;
    const last = events[0];
    setEvents((prev) => prev.slice(1));
    if (last.awardedTo) setScoreHistory((prev) => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const resetScore = () => {
    if (window.confirm('Réinitialiser le score et les événements ?')) {
      setEvents([]);
      setScoreHistory([INIT_SCORE]);
    }
  };

  const total = (team: Team, type?: StatType) =>
    events.filter((e) => e.team === team && (!type || e.type === type)).length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Analyse</div>
          <h1 className="page-title">Vidéo · Stats temps réel</h1>
        </div>
        {events.length > 0 && (
          <button onClick={resetScore} style={smallBtn}>Réinitialiser</button>
        )}
      </div>

      {/* ── Video ── */}
      <div style={{
        background: '#111', borderRadius: 16, overflow: 'hidden',
        marginBottom: 12, minHeight: videoSrc ? 0 : 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {videoSrc ? (
          <video ref={videoRef} src={videoSrc} controls playsInline
            style={{ width: '100%', maxHeight: '35vh', display: 'block' }} />
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{
            background: 'none', border: '2px dashed rgba(255,255,255,.2)',
            borderRadius: 14, color: 'rgba(255,255,255,.55)',
            padding: '20px 32px', cursor: 'pointer', fontSize: 14, margin: 12,
            fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui', fontWeight: 500,
          }}>📹 Charger une vidéo depuis la galerie</button>
        )}
        {videoSrc && (
          <button onClick={() => fileRef.current?.click()} style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: 8,
            color: 'white', fontSize: 11, padding: '5px 10px', cursor: 'pointer',
          }}>Changer</button>
        )}
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setVideoSrc(URL.createObjectURL(file));
          }} />
      </div>

      {/* ── Scoreboard ── */}
      <Scoreboard score={currentScore} ownLabel="Mon équipe" oppLabel="Adversaires" />

      {/* ── Pause toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Pause au tap</span>
        <div onClick={() => setPauseOnTap((v) => !v)} style={{
          width: 38, height: 22, borderRadius: 999,
          background: pauseOnTap ? 'var(--accent)' : 'var(--line)',
          position: 'relative', cursor: 'pointer', transition: 'background .15s',
        }}>
          <div style={{
            position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left .15s', left: pauseOnTap ? 18 : 2,
          }} />
        </div>
      </div>

      {/* ── Stat panels ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <TeamPanel label="Mon équipe"  color="var(--accent)" onStat={(t) => logStat('own', t)} />
        <div style={{ width: 1, background: 'var(--line)', flexShrink: 0 }} />
        <TeamPanel label="Adversaires" color="var(--warn)"   onStat={(t) => logStat('opp', t)} />
      </div>

      {/* ── Stats résumé ── */}
      {events.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 16,
        }}>
          {(['own', 'opp'] as Team[]).map((team) => (
            <div key={team} style={{
              background: 'var(--bg-elev)', borderRadius: 14, padding: '12px 14px',
              border: `1px solid ${team === 'own' ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'color-mix(in srgb, var(--warn) 30%, transparent)'}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: team === 'own' ? 'var(--accent)' : 'var(--warn)', marginBottom: 8 }}>
                {team === 'own' ? 'Mon équipe' : 'Adversaires'}
              </div>
              {(['winner','smash','coup-droit','revers','faute-directe','faute-provoquee'] as StatType[]).map((type) => {
                const n = total(team, type);
                if (!n) return null;
                return (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 3 }}>
                    <span>{STAT_LABELS[type]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{n}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Log ── */}
      {events.length > 0 && (
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{events.length} coup{events.length > 1 ? 's' : ''}</span>
            <button onClick={undoLast} style={smallBtn}>↩ Annuler</button>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {events.map((e) => (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderBottom: '1px solid var(--line)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', minWidth: 34 }}>
                  {fmt(e.time)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: e.team === 'own' ? 'var(--accent)' : 'var(--warn)', minWidth: 70 }}>
                  {e.team === 'own' ? 'Mon éq.' : 'Adv.'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>{STAT_LABELS[e.type]}</span>
                {e.awardedTo && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: e.awardedTo === 'own' ? 'var(--accent)' : 'var(--warn)', background: `color-mix(in srgb, ${e.awardedTo === 'own' ? 'var(--accent)' : 'var(--warn)'} 12%, transparent)`, borderRadius: 6, padding: '2px 6px' }}>
                    +1 pt
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, padding: '20px 0' }}>
          {videoSrc ? 'Lance la vidéo et tape les boutons ↑' : 'Charge une vidéo pour commencer'}
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
