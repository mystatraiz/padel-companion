'use client';

import { useEffect, useState } from 'react';
import { useStore, fastingStreaks } from '@/lib/store';
import { Icon } from '@/components/Icon';
import type { FastingSession } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TARGETS = [14, 16, 18, 20, 24] as const;

function fmtDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtHM(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Converts a JS Date to a datetime-local input value (local time) */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Circular timer ring ──────────────────────────────────────────────────────

function TimerRing({ progress, elapsed, target, done }: {
  progress: number; elapsed: string; target: number; done: boolean;
}) {
  const size = 220, stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.min(progress, 1);
  const color = done ? 'var(--good)' : 'var(--accent)';

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 4px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        {done && <div style={{ fontSize: 22 }}>🎉</div>}
        <div style={{
          fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em',
          fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
          color: done ? 'var(--good)' : 'var(--ink)',
        }}>
          {elapsed}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
          {done ? 'Objectif atteint !' : `/ ${target}h`}
        </div>
      </div>
    </div>
  );
}

// ─── Modal édition jeûne ──────────────────────────────────────────────────────

function EditFastModal({
  session,
  onClose,
}: {
  session: FastingSession;
  onClose: () => void;
}) {
  const { editFast, deleteFast } = useStore();
  const isActive = !session.endTime;

  const [startVal,  setStartVal]  = useState(toDatetimeLocal(session.startTime));
  const [endVal,    setEndVal]    = useState(session.endTime ? toDatetimeLocal(session.endTime) : '');
  const [targetVal, setTargetVal] = useState(session.targetHours);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleSave = () => {
    const startTime = new Date(startVal).toISOString();
    const endTime   = endVal ? new Date(endVal).toISOString() : undefined;
    editFast(session.id, { startTime, endTime, targetHours: targetVal });
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    deleteFast(session.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.02em' }}>
            {isActive ? 'Modifier le jeûne en cours' : 'Modifier ce jeûne'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: 4 }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Start time */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Heure de début
          </label>
          <input
            type="datetime-local"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box',
              border: '1px solid var(--line)', background: 'var(--bg)',
              color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {/* End time (hidden for active fast — it has no endTime yet) */}
        {!isActive && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Heure de fin
            </label>
            <input
              type="datetime-local"
              value={endVal}
              onChange={(e) => setEndVal(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box',
                border: '1px solid var(--line)', background: 'var(--bg)',
                color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
        )}

        {/* Target */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
            Durée cible
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TARGETS.map((h) => (
              <button
                key={h}
                onClick={() => setTargetVal(h)}
                style={{
                  padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: targetVal === h ? 'var(--accent)' : 'var(--bg-soft)',
                  color: targetVal === h ? 'var(--accent-ink)' : 'var(--ink-soft)',
                  fontSize: 13, fontWeight: 700, transition: 'all .15s',
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Enregistrer
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '11px 16px', borderRadius: 10, border: '1px solid var(--line)',
              background: confirmDel ? 'var(--warn)' : 'var(--bg-soft)',
              color: confirmDel ? 'white' : 'var(--warn)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              whiteSpace: 'nowrap',
            }}
          >
            {confirmDel ? 'Confirmer' : isActive ? 'Annuler ce jeûne' : 'Supprimer'}
          </button>
        </div>
        {confirmDel && (
          <button
            onClick={() => setConfirmDel(false)}
            style={{ width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--ink-faint)', fontSize: 13, cursor: 'pointer' }}
          >
            Garder
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FastingPage() {
  const { fastingSessions, startFast, stopFast } = useStore();
  const [tick,        setTick]        = useState(0);
  const [target,      setTarget]      = useState<number>(16);
  const [confirmStop, setConfirmStop] = useState(false);
  const [editSession, setEditSession] = useState<FastingSession | null>(null);

  const activeFast = fastingSessions.find((f) => !f.endTime) ?? null;

  // Tick every second when a fast is running
  useEffect(() => {
    if (!activeFast) return;
    const iv = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(iv);
  }, [activeFast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const elapsedMs   = activeFast ? Date.now() - new Date(activeFast.startTime).getTime() : 0;
  const targetMs    = (activeFast?.targetHours ?? target) * 3_600_000;
  const progress    = elapsedMs / targetMs;
  const done        = elapsedMs >= targetMs;
  const remainingMs = Math.max(targetMs - elapsedMs, 0);

  // Stats
  const completed   = fastingSessions.filter((s) => s.completed);
  const total       = fastingSessions.length;
  const { current: streak, best: bestStreak } = fastingStreaks(fastingSessions);
  const avgMs       = completed.length > 0
    ? completed.reduce((acc, s) => {
        if (!s.endTime) return acc;
        return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime());
      }, 0) / completed.length
    : 0;

  const history = fastingSessions.filter((s) => s.endTime).slice(0, 20);

  const handleStart = () => {
    startFast(target);
    setConfirmStop(false);
  };

  const handleStop = () => {
    if (!confirmStop) { setConfirmStop(true); return; }
    stopFast();
    setConfirmStop(false);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Santé</div>
          <h1 className="page-title">Jeûne intermittent</h1>
          {total > 0 && (
            <div className="page-sub">
              {total} jeûne{total > 1 ? 's' : ''} · {completed.length} complété{completed.length > 1 ? 's' : ''}
              {streak > 0 ? ` · 🔥 ${streak} jour${streak > 1 ? 's' : ''} d'affilée` : ''}
            </div>
          )}
        </div>
      </div>

      {/* ── Timer principal ── */}
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 20, border: '1px solid var(--line)',
        padding: '28px 20px 24px', marginBottom: 16, textAlign: 'center',
      }}>
        {activeFast ? (
          <>
            <TimerRing
              progress={progress}
              elapsed={fmtDuration(elapsedMs)}
              target={activeFast.targetHours}
              done={done}
            />

            {/* Info ligne */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Début</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
                  {new Date(activeFast.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Objectif</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
                  {new Date(new Date(activeFast.startTime).getTime() + targetMs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!done && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-faint)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Reste</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
                    {fmtHM(remainingMs)}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons stop + modifier */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {confirmStop ? (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    onClick={handleStop}
                    style={{
                      padding: '12px 28px', borderRadius: 12, border: 'none',
                      background: 'var(--warn)', color: 'white',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Oui, terminer
                  </button>
                  <button
                    onClick={() => setConfirmStop(false)}
                    style={{
                      padding: '12px 20px', borderRadius: 12, border: '1px solid var(--line)',
                      background: 'var(--bg-soft)', color: 'var(--ink-soft)',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStop}
                  style={{
                    width: '100%', maxWidth: 300, padding: '13px 0', borderRadius: 12,
                    border: '1px solid var(--line)', background: 'var(--bg-soft)',
                    color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Terminer le jeûne
                </button>
              )}
              {/* Modifier le jeûne actif */}
              <button
                onClick={() => setEditSession(activeFast)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ink-faint)', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Icon name="edit" size={13} />
                Modifier / annuler ce jeûne
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Sélecteur de durée */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 10 }}>
                Durée cible
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {TARGETS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setTarget(h)}
                    style={{
                      padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: target === h ? 'var(--accent)' : 'var(--bg-soft)',
                      color: target === h ? 'var(--accent-ink)' : 'var(--ink-soft)',
                      fontSize: 14, fontWeight: 700, transition: 'all .15s',
                    }}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              width: 160, height: 160, borderRadius: '50%', margin: '0 auto 24px',
              border: '3px dashed var(--line)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <div style={{ fontSize: 36 }}>🍽️</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Prêt à jeûner</div>
            </div>

            <button
              onClick={handleStart}
              style={{
                width: '100%', maxWidth: 300, padding: '14px 0', borderRadius: 12, border: 'none',
                background: 'var(--accent)', color: 'var(--accent-ink)',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🔥 Démarrer le jeûne {target}h
            </button>
          </>
        )}
      </div>

      {/* ── Statistiques ── */}
      {total > 0 && (
        <>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h2 className="section-title">Statistiques</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Séries complètes', value: completed.length, sub: `sur ${total} total` },
              { label: 'Taux réussite', value: total > 0 ? `${Math.round((completed.length / total) * 100)}%` : '—', sub: 'objectif atteint' },
              { label: '🔥 Série actuelle', value: streak > 0 ? `${streak}j` : '—', sub: 'jours d\'affilée', accent: streak > 0 },
              { label: '🏆 Meilleure série', value: bestStreak > 0 ? `${bestStreak}j` : '—', sub: 'record personnel', accent: true },
              { label: 'Durée moyenne', value: avgMs > 0 ? fmtHM(avgMs) : '—', sub: 'jeûnes complétés' },
              { label: 'Total jeûné', value: completed.length > 0 ? fmtHM(completed.reduce((acc, s) => {
                  if (!s.endTime) return acc;
                  return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime());
                }, 0)) : '—', sub: 'cumulé' },
            ].map((k) => (
              <div key={k.label} style={{
                background: 'var(--bg-elev)', borderRadius: 14, padding: '14px 16px',
                border: '1px solid var(--line)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 4 }}>{k.label}</div>
                <div style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em',
                  color: (k as any).accent ? 'var(--accent)' : 'var(--ink)',
                  fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
                }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Historique ── */}
      {history.length > 0 && (
        <>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h2 className="section-title">Historique</h2>
          </div>
          <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
            {history.map((s, i) => {
              const dur = s.endTime
                ? new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
                : 0;
              const pct = Math.min(Math.round((dur / (s.targetHours * 3_600_000)) * 100), 100);
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < history.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  {/* Statut */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: s.completed
                      ? 'color-mix(in srgb,var(--accent) 15%,transparent)'
                      : 'color-mix(in srgb,var(--warn) 12%,transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>
                    {s.completed ? '✓' : '○'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {dayLabel(s.startTime)}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                        background: s.completed
                          ? 'color-mix(in srgb,var(--accent) 15%,transparent)'
                          : 'color-mix(in srgb,var(--warn) 12%,transparent)',
                        color: s.completed ? 'var(--accent)' : 'var(--warn)',
                        flexShrink: 0,
                      }}>
                        {s.completed ? 'Complété' : 'Arrêté'}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>
                      {fmtHM(dur)} / {s.targetHours}h · {pct}%
                    </div>
                    {/* Barre de progression */}
                    <div style={{ height: 3, background: 'var(--bg-soft)', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, width: `${pct}%`,
                        background: s.completed ? 'var(--accent)' : 'var(--warn)',
                        transition: 'width .3s',
                      }} />
                    </div>
                  </div>

                  {/* Bouton éditer */}
                  <button
                    onClick={() => setEditSession(s)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-faint)', padding: 6, borderRadius: 8,
                      flexShrink: 0, display: 'flex', alignItems: 'center',
                    }}
                    title="Modifier"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {total === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, padding: '24px 0' }}>
          Lance ton premier jeûne pour commencer à tracker tes statistiques 🍽️
        </div>
      )}

      {/* ── Modal édition ── */}
      {editSession && (
        <EditFastModal
          session={editSession}
          onClose={() => setEditSession(null)}
        />
      )}
    </>
  );
}
