'use client';

import { useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { MatchShotStats, PlayerShotStats } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Team     = 'own' | 'opp';
type Player   = 'left' | 'right' | 'opp';
type StatType = 'smash' | 'coup-droit' | 'revers' | 'faute-directe' | 'faute-provoquee' | 'winner';

interface StatEvent {
  id:        number;
  time:      number;
  player:    Player;
  type:      StatType;
  awardedTo: Team | null;
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

const PLAYER_LABELS: Record<Player, string> = {
  left: 'J. Gauche', right: 'J. Droit', opp: 'Adv.',
};

// ─── Scoring logic ────────────────────────────────────────────────────────────

function pointWinner(team: Team, type: StatType): Team | null {
  if (type === 'winner')          return team;
  if (type === 'faute-provoquee') return team;
  if (type === 'faute-directe')   return team === 'own' ? 'opp' : 'own';
  return null;
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

  const setWon = (w: Team): Score => ({
    ...base,
    ownGames: 0, oppGames: 0,
    ownSets: w === 'own' ? s.ownSets + 1 : s.ownSets,
    oppSets: w === 'opp' ? s.oppSets + 1 : s.oppSets,
    setHistory: [...s.setHistory, [og, pg]],
  });

  if (og >= 6 && og - pg >= 2) return setWon('own');
  if (og === 7 && pg === 6)    return setWon('own');
  if (pg >= 6 && pg - og >= 2) return setWon('opp');
  if (pg === 7 && og === 6)    return setWon('opp');
  return base;
}

function awardPoint(s: Score, winner: Team): Score {
  const op = winner === 'own' ? s.ownPts + 1 : s.ownPts;
  const pp = winner === 'opp' ? s.oppPts + 1 : s.oppPts;
  if (op >= 4 && op - pp >= 2) return awardGame({ ...s, ownPts: 0, oppPts: 0 }, 'own');
  if (pp >= 4 && pp - op >= 2) return awardGame({ ...s, ownPts: 0, oppPts: 0 }, 'opp');
  return { ...s, ownPts: op, oppPts: pp };
}

function scoreStr(s: Score) {
  return s.setHistory.map(([o, p]) => `${o}-${p}`).join(', ');
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function Scoreboard({ score, matchOver }: { score: Score; matchOver: boolean }) {
  const [ownPt, oppPt] = displayPoints(score.ownPts, score.oppPts);
  const deuce = score.ownPts >= 3 && score.oppPts >= 3 && score.ownPts === score.oppPts;
  const won   = matchOver && score.ownSets > score.oppSets;
  const lost  = matchOver && score.oppSets > score.ownSets;

  const row = (label: string, sets: number, games: number, pts: string, accent: string, isOwn: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 86, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
        {label}
      </div>
      {score.setHistory.map(([o, p], i) => (
        <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {isOwn ? o : p}
        </div>
      ))}
      <div style={{ width: 36, textAlign: 'center', fontSize: 22, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', marginLeft: score.setHistory.length ? 8 : 0 }}>
        {games}
      </div>
      <div style={{ width: 44, textAlign: 'center', fontSize: 18, fontWeight: 700, color: pts === 'Ad' ? accent : 'var(--ink-soft)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', marginLeft: 12 }}>
        {matchOver ? sets : pts}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'var(--bg-elev)', borderRadius: 16,
      border: `1px solid ${matchOver ? (won ? 'color-mix(in srgb,var(--accent) 40%,transparent)' : 'color-mix(in srgb,var(--warn) 40%,transparent)') : 'var(--line)'}`,
      padding: '14px 16px', marginBottom: 12,
    }}>
      {matchOver && (
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: won ? 'var(--accent)' : 'var(--warn)',
          marginBottom: 10, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
        }}>
          {won ? '🏆 Victoire — ' : '❌ Défaite — '}{scoreStr(score)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 86 }} />
        {score.setHistory.map((_, i) => (
          <div key={i} style={{ width: 28, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em' }}>S{i + 1}</div>
        ))}
        <div style={{ width: 36, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em', marginLeft: score.setHistory.length ? 8 : 0 }}>Jeux</div>
        <div style={{ width: 44, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', letterSpacing: '.06em', marginLeft: 12 }}>
          {matchOver ? 'Sets' : (deuce ? 'Deuce' : 'Pts')}
        </div>
      </div>
      {row('Mon équipe',   score.ownSets, score.ownGames, ownPt, 'var(--accent)', true)}
      <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }} />
      {row('Adversaires', score.oppSets, score.oppGames, oppPt, 'var(--warn)', false)}
    </div>
  );
}

// ─── Player panel ─────────────────────────────────────────────────────────────

function PlayerPanel({ label, color, onStat, disabled, flipped }: {
  label: string; color: string; onStat: (type: StatType) => void; disabled?: boolean; flipped?: boolean;
}) {
  const cd1 = flipped ? 'revers' : 'coup-droit';
  const cd2 = flipped ? 'coup-droit' : 'revers';

  const Btn = ({ type, style }: { type: StatType; style?: React.CSSProperties }) => (
    <button
      onClick={() => !disabled && onStat(type)}
      disabled={disabled}
      style={{
        flex: 1, padding: '13px 4px', border: 'none', borderRadius: 12,
        fontWeight: 700, fontSize: 12, cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
        letterSpacing: '-0.01em', transition: 'transform .08s',
        opacity: disabled ? 0.35 : 1,
        ...style,
      }}
      onPointerDown={(e)  => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'scale(.93)'; }}
      onPointerUp={(e)    => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
    >
      {STAT_LABELS[type]}
    </button>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ paddingBottom: 6, borderBottom: `2px solid ${color}`, textAlign: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {label}
        </span>
      </div>
      <Btn type="smash"    style={{ background: 'var(--ink)', color: 'var(--bg-elev)', padding: '15px 4px', fontSize: 13 }} />
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type={cd1 as StatType} style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }} />
        <Btn type={cd2 as StatType} style={{ background: 'var(--bg-soft)', color: 'var(--ink)' }} />
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <Btn type="faute-directe"   style={{ background: 'color-mix(in srgb,var(--warn) 12%,transparent)', color: 'var(--warn)', border: '1px solid color-mix(in srgb,var(--warn) 25%,transparent)', fontSize: 11 }} />
        <Btn type="faute-provoquee" style={{ background: 'color-mix(in srgb,var(--warn) 12%,transparent)', color: 'var(--warn)', border: '1px solid color-mix(in srgb,var(--warn) 25%,transparent)', fontSize: 10 }} />
      </div>
      <Btn type="winner" style={{ background: color, color: 'white', padding: '16px 4px', fontSize: 14, borderRadius: 14 }} />
    </div>
  );
}

// ─── Save match modal ─────────────────────────────────────────────────────────

function SaveMatchModal({ score, events, onSaved, onClose }: {
  score: Score; events: StatEvent[]; onSaved: () => void; onClose: () => void;
}) {
  const { equipment, addMatch } = useStore();
  const rackets    = equipment.filter((e) => e.type === 'Raquette');
  const shoesList  = equipment.filter((e) => e.type === 'Chaussures');
  const won        = score.ownSets > score.oppSets;

  const [form, setForm] = useState({
    partners:   '',
    opponents:  '',
    venue:      '',
    court:      '',
    duration:   90,
    racket:     rackets.find((r) => r.primary)?.id ?? rackets[0]?.id ?? '',
    shoes:      shoesList.find((s) => s.primary)?.id ?? shoesList[0]?.id ?? '',
  });

  const field = (key: keyof typeof form, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const computeStats = (): MatchShotStats => {
    const forPlayer = (p: Player | null): PlayerShotStats => ({
      smash:          events.filter((e) => (!p || e.player === p) && e.type === 'smash').length,
      coupDroit:      events.filter((e) => (!p || e.player === p) && e.type === 'coup-droit').length,
      revers:         events.filter((e) => (!p || e.player === p) && e.type === 'revers').length,
      fauteDirecte:   events.filter((e) => (!p || e.player === p) && e.type === 'faute-directe').length,
      fauteProvoquee: events.filter((e) => (!p || e.player === p) && e.type === 'faute-provoquee').length,
      winner:         events.filter((e) => (!p || e.player === p) && e.type === 'winner').length,
    });
    return {
      total:       forPlayer(null),
      leftPlayer:  forPlayer('left'),
      rightPlayer: forPlayer('right'),
    };
  };

  const handleSave = () => {
    const stats = computeStats();
    addMatch({
      date:      new Date().toISOString().split('T')[0],
      duration:  form.duration / 60,
      partners:  form.partners,
      opponents: form.opponents,
      score:     scoreStr(score),
      result:    won ? 'win' : 'loss',
      venue:     form.venue,
      court:     form.court,
      racket:    form.racket,
      shoes:     form.shoes,
      stats,
    });
    onSaved();
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--line)',
    background: 'var(--bg-soft)', color: 'var(--ink)', fontSize: 13,
    fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui', outline: 'none',
    boxSizing: 'border-box',
  };

  const ownShots  = events.filter((e) => e.player !== 'opp');
  const statRows: [string, StatType][] = [
    ['Smash',           'smash'],
    ['Coup droit',      'coup-droit'],
    ['Revers',          'revers'],
    ['Winner',          'winner'],
    ['Faute directe',   'faute-directe'],
    ['Faute provoquée', 'faute-provoquee'],
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', maxWidth: 680, margin: '0 auto',
          background: 'var(--bg)', borderRadius: '20px 20px 0 0',
          padding: '24px 24px 32px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 20px' }} />

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: won ? 'var(--accent)' : 'var(--warn)', marginBottom: 4, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
            {won ? '🏆 Victoire' : '❌ Défaite'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Enregistrer le match
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 4 }}>
            Score : {scoreStr(score)}
          </div>
        </div>

        {/* Shot preview */}
        {ownShots.length > 0 && (
          <div style={{ background: 'var(--bg-elev)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 0' }}>
            {statRows.map(([label, type]) => {
              const n = ownShots.filter((e) => e.type === type).length;
              if (!n) return null;
              return (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingRight: 16 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{n}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={label}>Partenaire</div>
              <input style={inp} placeholder="Prénom Nom" value={form.partners}
                onChange={(e) => field('partners', e.target.value)} />
            </div>
            <div>
              <div style={label}>Adversaires</div>
              <input style={inp} placeholder="Équipe adverse" value={form.opponents}
                onChange={(e) => field('opponents', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={label}>Club / Lieu</div>
              <input style={inp} placeholder="Club" value={form.venue}
                onChange={(e) => field('venue', e.target.value)} />
            </div>
            <div>
              <div style={label}>Terrain</div>
              <input style={inp} placeholder="Terrain 1" value={form.court}
                onChange={(e) => field('court', e.target.value)} />
            </div>
          </div>

          <div>
            <div style={label}>Durée (minutes)</div>
            <input style={inp} type="number" min={10} max={240} value={form.duration}
              onChange={(e) => field('duration', Number(e.target.value))} />
          </div>

          {rackets.length > 0 && (
            <div>
              <div style={label}>Raquette</div>
              <select style={inp} value={form.racket} onChange={(e) => field('racket', e.target.value)}>
                {rackets.map((r) => <option key={r.id} value={r.id}>{r.brand} {r.name}</option>)}
              </select>
            </div>
          )}

          {shoesList.length > 0 && (
            <div>
              <div style={label}>Chaussures</div>
              <select style={inp} value={form.shoes} onChange={(e) => field('shoes', e.target.value)}>
                {shoesList.map((s) => <option key={s.id} value={s.id}>{s.brand} {s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', marginTop: 20, padding: '14px 0', borderRadius: 12, border: 'none',
            background: won ? 'var(--accent)' : 'var(--ink)', color: 'white',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
            fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
          }}
        >
          Sauvegarder le match
        </button>
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', marginBottom: 5,
  letterSpacing: '.04em', textTransform: 'uppercase',
};

// ─── Page principale ──────────────────────────────────────────────────────────

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

export default function AnalysePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const [videoSrc,     setVideoSrc]     = useState<string | null>(null);
  const [events,       setEvents]       = useState<StatEvent[]>([]);
  const [scoreHistory, setScoreHistory] = useState<Score[]>([INIT_SCORE]);
  const [pauseOnTap,   setPauseOnTap]   = useState(true);
  const [showSave,     setShowSave]     = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [flipped,      setFlipped]      = useState(false);

  const currentScore = scoreHistory[scoreHistory.length - 1];
  const matchOver    = currentScore.ownSets >= 2 || currentScore.oppSets >= 2;

  const logStat = useCallback((player: Player, type: StatType) => {
    const time = videoRef.current?.currentTime ?? 0;
    if (pauseOnTap) videoRef.current?.pause();

    const team: Team = player === 'opp' ? 'opp' : 'own';
    const winner  = pointWinner(team, type);
    const newScore = winner ? awardPoint(currentScore, winner) : currentScore;

    setEvents((prev) => [{ id: Date.now(), time, player, type, awardedTo: winner }, ...prev]);
    if (winner) setScoreHistory((prev) => [...prev, newScore]);
  }, [pauseOnTap, currentScore]);

  const undoLast = () => {
    if (!events.length) return;
    const last = events[0];
    setEvents((prev) => prev.slice(1));
    if (last.awardedTo) setScoreHistory((prev) => prev.length > 1 ? prev.slice(0, -1) : prev);
    setSaved(false);
  };

  const resetAll = () => {
    if (window.confirm('Réinitialiser le score et les événements ?')) {
      setEvents([]); setScoreHistory([INIT_SCORE]); setSaved(false);
    }
  };

  const total = (player: Player, type?: StatType) =>
    events.filter((e) => e.player === player && (!type || e.type === type)).length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Analyse</div>
          <h1 className="page-title">Vidéo · Stats temps réel</h1>
        </div>
        {events.length > 0 && !saved && (
          <button onClick={resetAll} style={smallBtn}>Réinitialiser</button>
        )}
      </div>

      {/* ── Vidéo ── */}
      <div style={{
        background: '#111', borderRadius: 16, overflow: 'hidden', marginBottom: 12,
        minHeight: videoSrc ? 0 : 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {videoSrc ? (
          <video ref={videoRef} src={videoSrc} controls playsInline style={{ width: '100%', maxHeight: '35vh', display: 'block' }} />
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{
            background: 'none', border: '2px dashed rgba(255,255,255,.2)', borderRadius: 14,
            color: 'rgba(255,255,255,.55)', padding: '20px 32px', cursor: 'pointer', fontSize: 14, margin: 12,
            fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui', fontWeight: 500,
          }}>📹 Charger une vidéo depuis la galerie</button>
        )}
        {videoSrc && (
          <button onClick={() => fileRef.current?.click()} style={{
            position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.5)', border: 'none',
            borderRadius: 8, color: 'white', fontSize: 11, padding: '5px 10px', cursor: 'pointer',
          }}>Changer</button>
        )}
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoSrc(URL.createObjectURL(f)); }} />
      </div>

      {/* ── Scoreboard ── */}
      <Scoreboard score={currentScore} matchOver={matchOver} />

      {/* ── Fin de match — bannière + bouton ── */}
      {matchOver && !saved && (
        <div style={{
          background: currentScore.ownSets > currentScore.oppSets
            ? 'color-mix(in srgb,var(--accent) 12%,transparent)'
            : 'color-mix(in srgb,var(--warn) 12%,transparent)',
          border: `1px solid ${currentScore.ownSets > currentScore.oppSets
            ? 'color-mix(in srgb,var(--accent) 30%,transparent)'
            : 'color-mix(in srgb,var(--warn) 30%,transparent)'}`,
          borderRadius: 14, padding: '12px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {currentScore.ownSets > currentScore.oppSets ? '🏆 Match terminé — Victoire !' : '❌ Match terminé — Défaite'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
              {scoreStr(currentScore)} · {events.filter(e => e.player !== 'opp').length} coups analysés
            </div>
          </div>
          <button
            onClick={() => setShowSave(true)}
            style={{
              background: currentScore.ownSets > currentScore.oppSets ? 'var(--accent)' : 'var(--ink)',
              border: 'none', borderRadius: 10, color: 'white',
              padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
            }}
          >
            Enregistrer →
          </button>
        </div>
      )}

      {saved && (
        <div style={{ background: 'color-mix(in srgb,var(--accent) 12%,transparent)', border: '1px solid color-mix(in srgb,var(--accent) 30%,transparent)', borderRadius: 14, padding: '12px 16px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
          ✓ Match enregistré et statistiques mises à jour
        </div>
      )}

      {/* ── Pause toggle ── */}
      {!matchOver && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Pause au tap</span>
          <div onClick={() => setPauseOnTap((v) => !v)} style={{ width: 38, height: 22, borderRadius: 999, background: pauseOnTap ? 'var(--accent)' : 'var(--line)', position: 'relative', cursor: 'pointer', transition: 'background .15s' }}>
            <div style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .15s', left: pauseOnTap ? 18 : 2 }} />
          </div>
        </div>
      )}

      {/* ── Panneaux joueurs ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'stretch' }}>
        <PlayerPanel label="Joueur Gauche" color="var(--accent)" onStat={(t) => logStat('left', t)}  disabled={matchOver} flipped={flipped} />
        {/* Séparateur + bouton inversion */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ flex: 1, width: 1, background: 'var(--line)' }} />
          <button
            onClick={() => setFlipped((f) => !f)}
            disabled={matchOver}
            title="Changer de côté"
            style={{
              background: flipped ? 'var(--ink)' : 'var(--bg-soft)',
              border: 'none', borderRadius: 8, width: 32, height: 32,
              fontSize: 14, cursor: matchOver ? 'default' : 'pointer',
              color: flipped ? 'white' : 'var(--ink-soft)',
              opacity: matchOver ? 0.3 : 1, transition: 'all .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >⇄</button>
          <div style={{ flex: 1, width: 1, background: 'var(--line)' }} />
        </div>
        <PlayerPanel label="Joueur Droit"  color="#7c6fcd"       onStat={(t) => logStat('right', t)} disabled={matchOver} flipped={flipped} />
      </div>

      {/* ── Point adverse direct ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <button
          onClick={() => !matchOver && logStat('opp', 'winner')}
          disabled={matchOver}
          style={{
            background: matchOver ? 'var(--bg-soft)' : 'color-mix(in srgb,var(--warn) 10%,transparent)',
            border: `1px solid ${matchOver ? 'var(--line)' : 'color-mix(in srgb,var(--warn) 30%,transparent)'}`,
            color: matchOver ? 'var(--ink-faint)' : 'var(--warn)',
            borderRadius: 10, padding: '9px 28px', fontSize: 12, fontWeight: 700,
            cursor: matchOver ? 'default' : 'pointer', opacity: matchOver ? 0.4 : 1,
            letterSpacing: '-0.01em', fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui', transition: 'transform .08s',
          }}
        >
          + Point adverse direct
        </button>
      </div>

      {/* ── Stats résumé par joueur ── */}
      {events.filter((e) => e.player !== 'opp').length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {(['left', 'right'] as const).map((player) => {
            const accent = player === 'left' ? 'var(--accent)' : '#7c6fcd';
            return (
              <div key={player} style={{ background: 'var(--bg-elev)', borderRadius: 14, padding: '12px 14px', border: `1px solid color-mix(in srgb,${accent} 30%,transparent)` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>
                  {player === 'left' ? 'Joueur Gauche' : 'Joueur Droit'}
                </div>
                {(['winner','smash','coup-droit','revers','faute-directe','faute-provoquee'] as StatType[]).map((type) => {
                  const n = total(player, type);
                  if (!n) return null;
                  return (
                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 3 }}>
                      <span>{STAT_LABELS[type]}</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>{n}</span>
                    </div>
                  );
                })}
                {total(player) === 0 && <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Aucun coup</div>}
              </div>
            );
          })}
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
            {events.map((e) => {
              const accent = e.player === 'left' ? 'var(--accent)' : e.player === 'right' ? '#7c6fcd' : 'var(--warn)';
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', minWidth: 34 }}>{fmt(e.time)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: accent, minWidth: 72 }}>{PLAYER_LABELS[e.player]}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>{STAT_LABELS[e.type]}</span>
                  {e.awardedTo && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: e.awardedTo === 'own' ? 'var(--accent)' : 'var(--warn)', background: `color-mix(in srgb,${e.awardedTo === 'own' ? 'var(--accent)' : 'var(--warn)'} 12%,transparent)`, borderRadius: 6, padding: '2px 6px' }}>+1 pt</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, padding: '20px 0' }}>
          {videoSrc ? 'Lance la vidéo et tape les boutons ↑' : 'Charge une vidéo pour commencer'}
        </div>
      )}

      {/* ── Modal sauvegarde ── */}
      {showSave && (
        <SaveMatchModal
          score={currentScore}
          events={events}
          onSaved={() => { setShowSave(false); setSaved(true); }}
          onClose={() => setShowSave(false)}
        />
      )}
    </>
  );
}

const smallBtn: React.CSSProperties = {
  background: 'var(--bg-soft)', border: 'none', borderRadius: 8,
  padding: '5px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  color: 'var(--ink-soft)', fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
};
