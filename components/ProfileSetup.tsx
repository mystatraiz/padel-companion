'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { saveUserProfile } from '@/lib/firestore';
import { useStore } from '@/lib/store';

// ─── Level data ───────────────────────────────────────────────────────────────

const LEVELS = [
  {
    n: 1, name: 'Débutant',
    evolution: 'Apprentissage des bases.',
    lines: ["Je commence à jouer. J'apprends les coups de base."],
    competition: null,
  },
  {
    n: 2, name: 'Perfectionnement',
    evolution: 'Développement des échanges courts et premières volées.',
    lines: ["Je joue les coups de base. Je joue lentement des échanges courts. Je commence à volleyer."],
    competition: null,
  },
  {
    n: 3, name: 'Élémentaire',
    evolution: 'Premiers matchs et adaptation avec les vitres.',
    lines: ["Je joue en loisir. Je sais servir et je joue des matchs avec échanges, en essayant de garder la balle en jeu. Je commence à jouer avec la vitre du fond."],
    competition: null,
  },
  {
    n: 4, name: 'Intermédiaire',
    evolution: 'Gestion des échanges longs et montée au filet.',
    lines: [
      "Je joue des matchs avec de longs échanges et montées-descentes répétées au filet.",
      "Je monte au filet au service et après un lob.",
      "Je redescends en défense sur lob adverse pour rejouer la balle.",
      "Je joue la balle après rebond sur la vitre.",
      "Je maîtrise le placement, notamment en fonction de mon partenaire.",
    ],
    competition: "Matchs gagnés en P25 et P100. Moyenne de points par tournoi : 5 à 25 pts.",
  },
  {
    n: 5, name: 'Confirmé',
    evolution: 'Maîtrise des lobs, volées et placements.',
    lines: [
      "Je maîtrise mon jeu : service-volée, repli sur les lobs, remontée en contre-attaque, coups avec effets.",
      "Je monte toujours au filet après un lob.",
      "Je finis des points à la volée et en smash.",
      "Je joue avec les vitres en défense, remise en jeu sur 360 et doubles vitres.",
    ],
    competition: "Top 1 500 (F) / Top 10 000 (H). P100 : 50 % de victoires min.",
  },
  {
    n: 6, name: 'Avancé',
    evolution: 'Intensité, variations et défense des doubles vitres.',
    lines: [
      "Je maîtrise le jeu rapide et les effets au service et dans le jeu.",
      "Je varie les zones et vitesses de mes volées.",
      "Je défends les doubles vitres et maîtrise parfaitement le 360.",
      "Je contre-attaque les smashes de l'adversaire.",
    ],
    competition: "Top 900 (F) / Top 6 000 (H). P250 : 50 % de victoires.",
  },
  {
    n: 7, name: 'Expert',
    evolution: 'Maîtrise tactique et défense exceptionnelle.',
    lines: [
      "Je maîtrise tous les aspects du jeu et les tactiques.",
      "J'utilise des effets appuyés : bandeja, vibora.",
      "Je défends les doubles vitres et remets en jeu.",
    ],
    competition: "Top 450 (F) / Top 3 000 (H). P250 : Finale ou tableau, victoires sur séries.",
  },
  {
    n: 8, name: 'Élite',
    evolution: 'Joueuses et joueurs de tournois majeurs.',
    lines: ["Participation aux tournois P1000, P1500 et P2000."],
    competition: "Top 150 (F) / Top 1 000 (H).",
  },
];

// ─── Toggle button ────────────────────────────────────────────────────────────

function Toggle<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-soft)',
      borderRadius: 10, padding: 3, gap: 3,
    }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
            background: value === o.value ? 'var(--accent)' : 'transparent',
            color: value === o.value ? 'var(--accent-ink)' : 'var(--ink-soft)',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
            transition: 'background .15s, color .15s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── ProfileSetup ─────────────────────────────────────────────────────────────

export function ProfileSetup() {
  const { user: authUser, completeProfile } = useAuth();
  const setUser = useStore((s) => s.setUser);
  const uid     = useStore((s) => s.uid);

  const [form, setForm] = useState({
    firstName:     '',
    lastName:      '',
    nickname:      '',
    level:         5,
    dominantHand:  'right' as 'left' | 'right',
    preferredSide: 'right' as 'left' | 'right',
    phone:         '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const level = LEVELS[form.level - 1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) { setError('Le prénom est obligatoire.'); return; }
    if (!uid) return;

    setSaving(true);
    setError('');
    try {
      await saveUserProfile(uid, form);
      const name     = `${form.firstName} ${form.lastName}`.trim();
      const initials = [form.firstName[0], form.lastName[0]].filter(Boolean).join('').toUpperCase() || form.firstName[0].toUpperCase();
      setUser({ ...form, name, initials });
      completeProfile();
    } catch {
      setError('Erreur lors de la sauvegarde. Réessaie.');
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 16px 60px', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, color: 'white', margin: '0 auto 16px',
          fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
        }}>PP</div>
        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Crée ton profil
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-faint)' }}>
          Bienvenue{authUser?.displayName ? `, ${authUser.displayName.split(' ')[0]}` : ''} ! Quelques infos pour personnaliser ton expérience.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Identité ── */}
        <section style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
            Identité
          </div>
          <Field label="Prénom *">
            <input
              type="text" placeholder="Ton prénom"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Nom">
            <input
              type="text" placeholder="Ton nom de famille"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Surnom">
            <input
              type="text" placeholder="Ton pseudo sur le terrain"
              value={form.nickname}
              onChange={(e) => set('nickname', e.target.value)}
              style={inputStyle}
            />
          </Field>
        </section>

        {/* ── Niveau ── */}
        <section style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
            Niveau
          </div>

          {/* Slider row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                {form.level} — {level.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>1 → 8</span>
            </div>
            <input
              type="range" min={1} max={8} step={1}
              value={form.level}
              onChange={(e) => set('level', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {LEVELS.map((l) => (
                <span key={l.n} style={{
                  fontSize: 10, color: form.level === l.n ? 'var(--accent)' : 'var(--ink-faint)',
                  fontWeight: form.level === l.n ? 700 : 400,
                  fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace',
                }}>{l.n}</span>
              ))}
            </div>
          </div>

          {/* Description card */}
          <div style={{
            background: 'var(--bg-soft)', borderRadius: 12, padding: 14,
            borderLeft: '3px solid var(--accent)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
              {level.evolution}
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {level.lines.map((line, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{line}</li>
              ))}
            </ul>
            {level.competition && (
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)',
                fontSize: 12, color: 'var(--ink-faint)', fontStyle: 'italic',
              }}>
                🏆 {level.competition}
              </div>
            )}
          </div>
        </section>

        {/* ── Jeu ── */}
        <section style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
            Style de jeu
          </div>
          <Field label="Main dominante">
            <Toggle
              value={form.dominantHand}
              onChange={(v) => set('dominantHand', v)}
              options={[{ value: 'left', label: '✋ Gauche' }, { value: 'right', label: 'Droite ✋' }]}
            />
          </Field>
          <Field label="Côté préféré">
            <Toggle
              value={form.preferredSide}
              onChange={(v) => set('preferredSide', v)}
              options={[{ value: 'left', label: '← Gauche' }, { value: 'right', label: 'Droite →' }]}
            />
          </Field>
        </section>

        {/* ── Contact ── */}
        <section style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontFamily: 'var(--font-jetbrains-mono, JetBrains Mono), monospace' }}>
            Contact
          </div>
          <Field label="Téléphone">
            <input
              type="tel" placeholder="+33 6 00 00 00 00"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              style={inputStyle}
            />
          </Field>
        </section>

        {error && (
          <div style={{ color: 'var(--warn)', fontSize: 13, textAlign: 'center' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '14px', borderRadius: 14, border: 'none',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            fontSize: 16, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, letterSpacing: '-0.01em',
            fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
            transition: 'opacity .15s',
          }}
        >
          {saving ? 'Enregistrement…' : 'Commencer →'}
        </button>
      </form>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 10,
  border: '1px solid var(--line)', background: 'var(--bg)',
  color: 'var(--ink)', fontSize: 15,
  fontFamily: 'var(--font-inter-tight, Inter Tight), system-ui',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};
