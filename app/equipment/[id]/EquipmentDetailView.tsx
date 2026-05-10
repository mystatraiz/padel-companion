'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { RacketSVG } from '@/components/RacketSVG';
import { ShoeSVG } from '@/components/ShoeSVG';
import { useStore, wearPct, wearClass, MONTHS_FR } from '@/lib/store';

export function EquipmentDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { equipment, matches, setPrimary, deleteEquipment } = useStore();
  const e = equipment.find((x) => x.id === id);

  if (!e) {
    return (
      <div>
        Pièce introuvable.{' '}
        <button className="btn" onClick={() => router.push('/equipment')}>
          Retour
        </button>
      </div>
    );
  }

  const usedIn = matches.filter((m) => m.racket === id || m.shoes === id);
  const pct = wearPct(e);
  const costPerHour = e.hours > 0 ? (e.price / e.hours).toFixed(2) : '—';

  const handleDelete = () => {
    if (window.confirm('Supprimer cette pièce ?')) {
      deleteEquipment(e.id);
      router.push('/equipment');
    }
  };

  return (
    <>
      <button className="detail-back" onClick={() => router.push('/equipment')}>
        <Icon name="back" size={16} /> Matériel
      </button>

      <div className="page-head">
        <div>
          <div className="eyebrow">{e.type}</div>
          <h1 className="page-title">
            {e.brand} {e.name}
          </h1>
          <div className="page-sub">
            {e.type === 'Raquette' ? `${e.weight}g · ${e.shape}` : `Taille ${e.size}`} · acheté le{' '}
            {new Date(e.purchased).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!e.primary && (
            <button className="btn" onClick={() => setPrimary(e.id)}>
              <Icon name="check" size={14} /> Définir comme actif
            </button>
          )}
          <button className="btn" onClick={handleDelete}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="hero">
        <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div
            className="equip-thumb"
            style={{ width: 200, height: 200, borderRadius: 16, flex: '0 0 200px' }}
          >
            {e.type === 'Raquette' ? <RacketSVG /> : <ShoeSVG />}
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">État d&apos;usure</div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                letterSpacing: '-0.04em',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1,
                marginTop: 4,
              }}
            >
              {pct}%
            </div>
            <div className="wear-bar mt-12" style={{ height: 12 }}>
              <div className={`wear-fill ${wearClass(e)}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="wear-row" style={{ fontSize: 13 }}>
              <span>{e.hours.toFixed(1)}h utilisées</span>
              <span>Reste ~{(e.hoursMax - e.hours).toFixed(0)}h</span>
            </div>
            {pct > 80 && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: 'var(--warn)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="alert" size={14} /> Remplacement conseillé
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow">Coût d&apos;usage</div>
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr', gap: 10, marginTop: 8 }}>
            <div className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <div className="label">Prix d&apos;achat</div>
              <div className="value">
                {e.price}
                <span className="unit">€</span>
              </div>
            </div>
            <div className="kpi" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <div className="label">Coût / heure</div>
              <div className="value">
                {costPerHour}
                <span className="unit">€/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">
            Utilisé dans {usedIn.length} match{usedIn.length > 1 ? 's' : ''}
          </h2>
        </div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {usedIn.length === 0 && (
            <div style={{ padding: 16, color: 'var(--ink-faint)', fontSize: 13 }}>
              Aucun match enregistré avec cet équipement.
            </div>
          )}
          {usedIn.slice(0, 8).map((m) => {
            const d = new Date(m.date);
            return (
              <div key={m.id} className="match-row" onClick={() => router.push(`/match/${m.id}`)}>
                <div className="match-date">
                  <div className="day">{d.getDate()}</div>
                  <div className="mon">{MONTHS_FR[d.getMonth()]}</div>
                </div>
                <div className="match-info">
                  <div className="partners">
                    {m.partners}
                    {m.opponents !== '—' ? ` vs ${m.opponents}` : ''}
                  </div>
                  <div className="meta">
                    {m.duration}h · {m.venue}
                  </div>
                </div>
                <div className="tag-col">
                  <span className="tag">{m.duration}h</span>
                </div>
                <span
                  className={`match-score ${m.result === 'win' ? 'win' : m.result === 'loss' ? 'loss' : ''}`}
                >
                  {m.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
