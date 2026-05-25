'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

// ─── Types & Data ─────────────────────────────────────────────────────────────

type ExType = 'cardio' | 'mobility' | 'activation' | 'specific' | 'breathing';

interface Exercise {
  name: string;
  duration: number; // seconds
  desc: string;
  emoji: string;
  type: ExType;
}

interface Protocol {
  id: 7 | 12 | 15;
  label: string;
  desc: string;
  color: string;
  exercises: Exercise[];
}

const TYPE_COLOR: Record<ExType, string> = {
  cardio:     '#ff7a59',
  mobility:   '#7c6fcd',
  activation: 'var(--accent)',
  specific:   '#0ea5e9',
  breathing:  'var(--good)',
};

const TYPE_LABEL: Record<ExType, string> = {
  cardio:     'Cardio',
  mobility:   'Mobilité',
  activation: 'Activation',
  specific:   'Padel',
  breathing:  'Récupération',
};

const PROTOCOLS: Protocol[] = [
  {
    id: 7,
    label: '7 min',
    desc: 'L\'essentiel avant match',
    color: '#7c6fcd',
    exercises: [
      { name: 'Footing sur place',       duration: 60, emoji: '🏃', type: 'cardio',     desc: 'Lève les genoux, pompe les bras à rythme modéré. Respiration régulière.' },
      { name: 'Cercles d\'épaules',      duration: 30, emoji: '💫', type: 'mobility',   desc: 'Grands cercles vers l\'avant puis l\'arrière. Relâche les tensions.' },
      { name: 'Rotations des hanches',   duration: 30, emoji: '🌀', type: 'mobility',   desc: 'Mains sur les hanches, cercles larges dans les deux sens.' },
      { name: 'Rotations du tronc',      duration: 30, emoji: '🔄', type: 'mobility',   desc: 'Bras tendus devant toi, rotation lente gauche/droite en alternance.' },
      { name: 'Fentes avant alternées',  duration: 60, emoji: '🦵', type: 'activation', desc: 'Genou avant à 90°, garde le dos droit. Alterne jambe gauche et droite.' },
      { name: 'Squats dynamiques',       duration: 60, emoji: '🏋️', type: 'activation', desc: 'Pieds largeur d\'épaules, descends les fesses vers l\'arrière, garde le buste droit.' },
      { name: 'Montées de genoux',       duration: 45, emoji: '⚡', type: 'cardio',     desc: 'Cours sur place, genoux à hauteur de hanches, bras actifs.' },
      { name: 'Shadow padel',            duration: 75, emoji: '🎾', type: 'specific',   desc: 'Simule coup droit, revers, déplacements. Pense à ta posture de frappe.' },
      { name: 'Étirements & respiration',duration: 30, emoji: '🌬️', type: 'breathing',  desc: 'Inspirations profondes (4s), expirations longues (6s). Étirez bras et cou.' },
    ],
  },
  {
    id: 12,
    label: '12 min',
    desc: 'Complet & progressif',
    color: '#0ea5e9',
    exercises: [
      { name: 'Footing sur place',       duration: 90, emoji: '🏃', type: 'cardio',     desc: 'Démarre doucement puis accélère progressivement. Respire par le nez.' },
      { name: 'Cercles d\'épaules',      duration: 30, emoji: '💫', type: 'mobility',   desc: 'Grands cercles vers l\'avant puis l\'arrière. Ouvre bien l\'articulation.' },
      { name: 'Rotations du cou',        duration: 20, emoji: '🔃', type: 'mobility',   desc: 'Demi-cercles lents, gauche puis droite. Jamais en arrière complet.' },
      { name: 'Rotations des hanches',   duration: 30, emoji: '🌀', type: 'mobility',   desc: 'Mains sur les hanches, grands cercles dans les deux sens.' },
      { name: 'Pompes de mollets',       duration: 30, emoji: '🦶', type: 'activation', desc: 'Debout, monte sur la pointe des pieds et redescends lentement.' },
      { name: 'Rotations du tronc',      duration: 30, emoji: '🔄', type: 'mobility',   desc: 'Bras tendus, rotation gauche/droite. Garde les hanches fixes.' },
      { name: 'Fentes avant alternées',  duration: 60, emoji: '🦵', type: 'activation', desc: 'Genou avant à 90°, genou arrière proche du sol. Alterne les jambes.' },
      { name: 'Fentes latérales',        duration: 45, emoji: '↔️', type: 'activation', desc: 'Jambe tendue d\'un côté, plie l\'autre jambe. Excellent pour le padel !' },
      { name: 'Squats sautés',           duration: 60, emoji: '🚀', type: 'cardio',     desc: 'Squat profond puis saute à la réception. Atterris souple sur les orteils.' },
      { name: 'Jumping jacks',           duration: 45, emoji: '⭐', type: 'cardio',     desc: 'Sauts avec écartement des bras et des jambes simultanément.' },
      { name: 'Montées de genoux',       duration: 45, emoji: '⚡', type: 'cardio',     desc: 'Cours sur place, genoux hauts, bras actifs, rythme rapide.' },
      { name: 'Talons-fesses',           duration: 45, emoji: '🔥', type: 'cardio',     desc: 'Cours sur place en ramenant les talons vers les fesses.' },
      { name: 'Shadow coup droit',       duration: 45, emoji: '🎾', type: 'specific',   desc: 'Coup droit padel : rotation épaules, frappe en extension, finition haute.' },
      { name: 'Shadow revers',           duration: 45, emoji: '🏸', type: 'specific',   desc: 'Revers : rotation vers l\'arrière, frappe face au filet, bras tendu.' },
      { name: 'Déplacements & smash',    duration: 45, emoji: '💥', type: 'specific',   desc: 'Déplacement latéral 2 pas + smash simulé. Simule le jeu réel.' },
      { name: 'Étirements & respiration',duration: 55, emoji: '🌬️', type: 'breathing',  desc: 'Étirez ischio-jambiers, épaules, cou. Respirations profondes pour récupérer.' },
    ],
  },
  {
    id: 15,
    label: '15 min',
    desc: 'Optimal avant compétition',
    color: '#f59e0b',
    exercises: [
      { name: 'Footing léger',           duration: 90, emoji: '🏃', type: 'cardio',     desc: 'Jogging sur place, progressivement plus vite. Active le système cardiovasculaire.' },
      { name: 'Cercles épaules AV',      duration: 25, emoji: '💫', type: 'mobility',   desc: 'Grands cercles vers l\'avant, en insistant sur l\'amplitude maximale.' },
      { name: 'Cercles épaules AR',      duration: 25, emoji: '🔙', type: 'mobility',   desc: 'Grands cercles vers l\'arrière, ouvre bien l\'épaule et la poitrine.' },
      { name: 'Rotations du cou',        duration: 20, emoji: '🔃', type: 'mobility',   desc: 'Demi-cercles lents et contrôlés. Jamais en hyperextension arrière.' },
      { name: 'Rotations des hanches',   duration: 30, emoji: '🌀', type: 'mobility',   desc: 'Cercles larges dans les deux sens, amplitude maximale.' },
      { name: 'Rotations du tronc',      duration: 30, emoji: '🔄', type: 'mobility',   desc: 'Bras tendus à hauteur d\'épaules, rotation lente et ample.' },
      { name: 'Pompes de mollets',       duration: 30, emoji: '🦶', type: 'activation', desc: 'Monte sur la pointe des pieds lentement, redescends. Prépare les appuis.' },
      { name: 'Fentes avant alternées',  duration: 60, emoji: '🦵', type: 'activation', desc: 'Fentes profondes, genou arrière proche du sol. Garde le buste droit.' },
      { name: 'Fentes latérales',        duration: 45, emoji: '↔️', type: 'activation', desc: 'Écarte une jambe sur le côté, plie-la à 90°. Fondamental pour le padel.' },
      { name: 'Squats sautés',           duration: 60, emoji: '🚀', type: 'cardio',     desc: 'Squat profond, impulsion explosive vers le haut. Réception silencieuse.' },
      { name: 'Jumping jacks',           duration: 45, emoji: '⭐', type: 'cardio',     desc: 'Coordination bras-jambes. Accélère progressivement.' },
      { name: 'Montées de genoux',       duration: 45, emoji: '⚡', type: 'cardio',     desc: 'Intensité maximale, genoux hauts, bras dynamiques.' },
      { name: 'Talons-fesses',           duration: 45, emoji: '🔥', type: 'cardio',     desc: 'Ramène les talons aux fesses. Garde le buste droit et les hanches stables.' },
      { name: 'Burpees légers',          duration: 45, emoji: '💪', type: 'cardio',     desc: 'Squat → planche → squat → debout. Pas de saut, reste fluide.' },
      { name: 'Shadow coup droit',       duration: 45, emoji: '🎾', type: 'specific',   desc: 'Frappe coup droit avec rotation complète du buste. Finition au-dessus de l\'épaule.' },
      { name: 'Shadow revers',           duration: 45, emoji: '🏸', type: 'specific',   desc: 'Revers avec préparation, bras actifs, et accompagnement du coup.' },
      { name: 'Déplacements latéraux',   duration: 45, emoji: '↔️', type: 'specific',   desc: 'Pas chassés rapides sur la largeur du court. Reste sur la pointe des pieds.' },
      { name: 'Smash simulé',            duration: 30, emoji: '💥', type: 'specific',   desc: 'Recul, positionne-toi en dessous du smash imaginaire, frappe en extension.' },
      { name: 'Bandeja simulée',         duration: 30, emoji: '🏆', type: 'specific',   desc: 'Smash latéral contrôlé. Rotation du buste, frappe côté, amortis la chute.' },
      { name: 'Étirements actifs bras',  duration: 45, emoji: '🤸', type: 'breathing',  desc: 'Étirez pectoraux (bras en croix), triceps (coude vers la tête), poignets.' },
      { name: 'Respiration finale',      duration: 60, emoji: '🌬️', type: 'breathing',  desc: 'Inspirez 4s, retenez 2s, expirez 6s. Prépare ton mental pour le match.' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

function totalDuration(p: Protocol): number {
  return p.exercises.reduce((a, e) => a + e.duration, 0);
}

// ─── Ring countdown ───────────────────────────────────────────────────────────

function Ring({ progress, seconds, color }: { progress: number; seconds: number; color: string }) {
  const size = 220, stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(progress, 0);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.4s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: seconds >= 100 ? 44 : 56, fontWeight: 800, letterSpacing: '-0.04em',
          fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
          color, lineHeight: 1,
        }}>
          {seconds}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4 }}>
          sec
        </div>
      </div>
    </div>
  );
}

// ─── Exercise row (preview list) ──────────────────────────────────────────────

function ExRow({ ex, index, active, done }: { ex: Exercise; index: number; active: boolean; done: boolean }) {
  const color = TYPE_COLOR[ex.type];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
      background: active ? `color-mix(in srgb,${color} 8%,var(--bg-elev))` : 'transparent',
      borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
      opacity: done ? 0.4 : 1, transition: 'all .25s',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--bg-soft)' : `color-mix(in srgb,${color} 15%,transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: done ? 12 : 14,
      }}>
        {done ? '✓' : ex.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? color : 'var(--ink)' }}>
          {ex.name}
        </div>
        {active && (
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ex.desc}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
          background: `color-mix(in srgb,${color} 15%,transparent)`,
          color, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
        }}>
          {TYPE_LABEL[ex.type]}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)',
          fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
          minWidth: 32, textAlign: 'right',
        }}>
          {fmtS(ex.duration)}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'running' | 'paused' | 'done';

export default function WarmupPage() {
  const router = useRouter();
  const [protoId,    setProtoId]    = useState<7 | 12 | 15>(7);
  const [phase,      setPhase]      = useState<Phase>('idle');
  const [exIndex,    setExIndex]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [flash,      setFlash]      = useState(false); // brief flash on exercise change
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const protocol  = PROTOCOLS.find((p) => p.id === protoId)!;
  const exercises = protocol.exercises;
  const curEx     = exercises[exIndex];
  const nextEx    = exercises[exIndex + 1] ?? null;

  const totalSec  = totalDuration(protocol);
  const elapsed   = exercises.slice(0, exIndex).reduce((a, e) => a + e.duration, 0) + (curEx.duration - timeLeft);
  const overallProgress = elapsed / totalSec;

  const color = curEx ? TYPE_COLOR[curEx.type] : 'var(--accent)';

  // Advance to next exercise or finish
  const advance = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    setExIndex((prev) => {
      const next = prev + 1;
      if (next >= exercises.length) {
        setPhase('done');
        return prev;
      }
      setTimeLeft(exercises[next].duration);
      return next;
    });
  }, [exercises]);

  // Interval tick
  useEffect(() => {
    if (phase !== 'running') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { advance(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, advance]);

  const handleStart = () => {
    setExIndex(0);
    setTimeLeft(exercises[0].duration);
    setPhase('running');
  };

  const handlePause = () => setPhase('paused');
  const handleResume = () => setPhase('running');

  const handleSkip = () => {
    if (exIndex < exercises.length - 1) {
      advance();
    }
  };

  const handleStop = () => {
    setPhase('idle');
    setExIndex(0);
    setTimeLeft(0);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => handleStart(), 50);
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────

  if (phase === 'idle') {
    return (
      <>
        <div className="page-head">
          <div>
            <div className="eyebrow">Padel</div>
            <h1 className="page-title">Échauffement</h1>
            <div className="page-sub">Prépare ton corps avant de jouer</div>
          </div>
        </div>

        {/* Sélecteur de protocole */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {PROTOCOLS.map((p) => {
            const active = p.id === protoId;
            const total = totalDuration(p);
            return (
              <div
                key={p.id}
                onClick={() => setProtoId(p.id)}
                style={{
                  background: active ? `color-mix(in srgb,${p.color} 12%,var(--bg-elev))` : 'var(--bg-elev)',
                  border: `2px solid ${active ? p.color : 'var(--line)'}`,
                  borderRadius: 16, padding: '16px 14px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: active ? p.color : 'var(--ink)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: active ? p.color : 'var(--ink-faint)', marginTop: 4, fontWeight: 500 }}>
                  {p.desc}
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 6, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
                  {p.exercises.length} exercices · {fmtS(total)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Liste des exercices */}
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Programme — {protocol.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
              {fmtS(totalDuration(protocol))} total
            </div>
          </div>
          {exercises.map((ex, i) => {
            const offset = exercises.slice(0, i).reduce((a, e) => a + e.duration, 0);
            return (
              <div key={i} style={{ borderBottom: i < exercises.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: `color-mix(in srgb,${TYPE_COLOR[ex.type]} 15%,transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>
                    {ex.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                      background: `color-mix(in srgb,${TYPE_COLOR[ex.type]} 15%,transparent)`,
                      color: TYPE_COLOR[ex.type],
                    }}>
                      {TYPE_LABEL[ex.type]}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', minWidth: 28, textAlign: 'right' }}>
                      {fmtS(ex.duration)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton démarrer */}
        <button
          onClick={handleStart}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
            background: protocol.color, color: 'white',
            fontSize: 16, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            letterSpacing: '-0.01em',
          }}
        >
          <Icon name="play" size={18} />
          Commencer l'échauffement {protocol.label}
        </button>
      </>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    return (
      <>
        <div className="page-head">
          <div>
            <div className="eyebrow">Padel</div>
            <h1 className="page-title">Échauffement</h1>
          </div>
        </div>
        <div style={{
          background: 'var(--bg-elev)', borderRadius: 20, border: '1px solid var(--line)',
          padding: '48px 24px', textAlign: 'center', marginBottom: 16,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Échauffement terminé !
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-faint)', marginBottom: 28 }}>
            {protocol.exercises.length} exercices · {fmtS(totalDuration(protocol))} · Tu es prêt à jouer 💪
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Exercices', value: String(protocol.exercises.length) },
              { label: 'Durée', value: fmtS(totalDuration(protocol)) },
              { label: 'Protocole', value: protocol.label },
            ].map((k) => (
              <div key={k.label} style={{ background: 'var(--bg-soft)', borderRadius: 12, padding: '12px 8px' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace', color: 'var(--accent)' }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleRestart}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
                background: protocol.color, color: 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Recommencer
            </button>
            <button
              onClick={handleStop}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 12,
                border: '1px solid var(--line)', background: 'var(--bg-soft)',
                color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Retour
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── RUNNING / PAUSED ──────────────────────────────────────────────────────

  const progress = timeLeft / curEx.duration;

  return (
    <>
      {/* Overall progress bar */}
      <div style={{ height: 4, background: 'var(--bg-soft)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${overallProgress * 100}%`,
          background: protocol.color,
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Header mini */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {exIndex + 1} / {exercises.length}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
          {fmtS(Math.round((1 - overallProgress) * totalSec))} restant
        </div>
      </div>

      {/* Carte exercice principal */}
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 20,
        border: `1px solid color-mix(in srgb,${color} 30%,var(--line))`,
        padding: '24px 20px', marginBottom: 12, textAlign: 'center',
        transition: 'border-color .4s',
        opacity: flash ? 0.6 : 1,
      }}>
        {/* Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Ring progress={progress} seconds={timeLeft} color={color} />
        </div>

        {/* Emoji + Nom */}
        <div style={{ fontSize: 32, marginBottom: 8 }}>{curEx.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color, marginBottom: 8 }}>
          {curEx.name}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 12,
          background: `color-mix(in srgb,${color} 15%,transparent)`, color,
        }}>
          {TYPE_LABEL[curEx.type].toUpperCase()}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 360, margin: '0 auto' }}>
          {curEx.desc}
        </div>
      </div>

      {/* Prochain exercice */}
      {nextEx && (
        <div style={{
          background: 'var(--bg-elev)', borderRadius: 14, border: '1px solid var(--line)',
          padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', flexShrink: 0 }}>
            Suivant
          </div>
          <div style={{ fontSize: 18, flexShrink: 0 }}>{nextEx.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{nextEx.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{fmtS(nextEx.duration)}</div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, flexShrink: 0,
            background: `color-mix(in srgb,${TYPE_COLOR[nextEx.type]} 15%,transparent)`,
            color: TYPE_COLOR[nextEx.type],
          }}>
            {TYPE_LABEL[nextEx.type]}
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {phase === 'running' ? (
          <button
            onClick={handlePause}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
              background: protocol.color, color: 'white',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="pause" size={18} />
            Pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
              background: protocol.color, color: 'white',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="play" size={18} />
            Reprendre
          </button>
        )}

        <button
          onClick={handleSkip}
          disabled={exIndex >= exercises.length - 1}
          style={{
            padding: '14px 18px', borderRadius: 12,
            border: '1px solid var(--line)', background: 'var(--bg-soft)',
            color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: exIndex >= exercises.length - 1 ? 0.4 : 1,
          }}
        >
          <Icon name="skip" size={16} />
          Suivant
        </button>

        <button
          onClick={handleStop}
          style={{
            padding: '14px 18px', borderRadius: 12,
            border: '1px solid var(--line)', background: 'var(--bg-soft)',
            color: 'var(--warn)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Liste exercices condensée */}
      <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{ borderBottom: i < exercises.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <ExRow ex={ex} index={i} active={i === exIndex} done={i < exIndex} />
          </div>
        ))}
      </div>
    </>
  );
}
