'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useStore, wearPct } from '@/lib/store';

export default function PadelHub() {
  const router = useRouter();
  const { matches, upcoming, equipment } = useStore();

  const wins    = matches.filter((m) => m.result === 'win').length;
  const losses  = matches.filter((m) => m.result === 'loss').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
  const lastMatch = matches[0];
  const nextMatch = upcoming[0];
  const alertEq   = equipment.find((e) => wearPct(e) > 80);

  const sections = [
    {
      id: 'stats',
      href: '/stats',
      icon: 'stats' as const,
      label: 'Statistiques',
      desc: winRate !== null ? `${winRate}% win rate · ${matches.length} matchs` : `${matches.length} matchs joués`,
      accent: 'var(--accent)',
    },
    {
      id: 'calendar',
      href: '/calendar',
      icon: 'calendar' as const,
      label: 'Agenda',
      desc: nextMatch ? `Prochain : ${new Date(nextMatch.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ${nextMatch.time}` : 'Aucun match planifié',
      accent: '#7c6fcd',
    },
    {
      id: 'warmup',
      href: '/warmup',
      icon: 'zap' as const,
      label: 'Échauffement',
      desc: '3 protocoles · 7 / 12 / 15 min',
      accent: '#f59e0b',
    },
    {
      id: 'analyse',
      href: '/analyse',
      icon: 'video' as const,
      label: 'Analyse vidéo',
      desc: lastMatch ? `Dernier match : ${lastMatch.score || lastMatch.result}` : 'Analyse tes matchs en vidéo',
      accent: '#0ea5e9',
    },
    {
      id: 'equipment',
      href: '/equipment',
      icon: 'racket' as const,
      label: 'Matériel',
      desc: alertEq ? `⚠️ ${alertEq.brand} ${alertEq.name} à remplacer` : `${equipment.length} équipement${equipment.length !== 1 ? 's' : ''}`,
      accent: alertEq ? 'var(--warn)' : '#e879f9',
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Sport</div>
          <h1 className="page-title">Padel</h1>
          {matches.length > 0 && (
            <div className="page-sub">
              {matches.length} match{matches.length !== 1 ? 's' : ''}
              {winRate !== null ? ` · ${winRate}% victoires` : ''}
              {wins > 0 ? ` · ${wins}V ${losses}D` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Grille des sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {sections.map((s) => (
          <div
            key={s.id}
            onClick={() => router.push(s.href)}
            style={{
              background: 'var(--bg-elev)', borderRadius: 16,
              border: '1px solid var(--line)', padding: '18px 16px',
              cursor: 'pointer', transition: 'transform .1s',
            }}
            onPointerDown={(e)  => (e.currentTarget.style.transform = 'scale(.97)')}
            onPointerUp={(e)    => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, marginBottom: 10,
              background: `color-mix(in srgb,${s.accent} 15%,transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.accent,
            }}>
              <Icon name={s.icon} size={18} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.4 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Dernier match */}
      {lastMatch && (
        <div style={{ background: 'var(--bg-elev)', borderRadius: 16, border: '1px solid var(--line)', padding: '16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 10 }}>
            Dernier match
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: lastMatch.result === 'win'
                ? 'color-mix(in srgb,var(--accent) 15%,transparent)'
                : 'color-mix(in srgb,var(--warn) 15%,transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>
              {lastMatch.result === 'win' ? '🏆' : lastMatch.result === 'loss' ? '❌' : '📚'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                vs {lastMatch.opponents || 'Adversaires'}
                {lastMatch.score ? ` · ${lastMatch.score}` : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                {lastMatch.date}{lastMatch.venue ? ` · ${lastMatch.venue}` : ''}
              </div>
            </div>
            <button
              onClick={() => router.push('/stats')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Voir tout →
            </button>
          </div>
        </div>
      )}

      {/* Prochain match */}
      {nextMatch && (
        <div style={{ background: 'color-mix(in srgb,#7c6fcd 8%,transparent)', borderRadius: 16, border: '1px solid color-mix(in srgb,#7c6fcd 25%,transparent)', padding: '16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7c6fcd', marginBottom: 10 }}>
            Prochain match
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="calendar" size={20} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {new Date(nextMatch.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {nextMatch.time}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                {nextMatch.venue} · Court {nextMatch.court}{nextMatch.partners ? ` · avec ${nextMatch.partners}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 && !nextMatch && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-faint)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎾</div>
          <div style={{ fontSize: 14 }}>Aucun match enregistré pour l'instant</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Ajoute ton premier match via les Stats ou l'Analyse</div>
        </div>
      )}
    </>
  );
}
