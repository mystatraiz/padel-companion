'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { RacketSVG } from '@/components/RacketSVG';
import { ShoeSVG } from '@/components/ShoeSVG';
import { useStore, wearPct, wearClass } from '@/lib/store';
import { useShell } from '@/components/AppShell';
import type { Equipment } from '@/lib/types';

function EquipCard({ e }: { e: Equipment }) {
  const router = useRouter();
  const pct = wearPct(e);
  return (
    <div className="equip-card" onClick={() => router.push(`/equipment/${e.id}`)}>
      <div className="equip-thumb">
        {e.type === 'Raquette' ? <RacketSVG /> : <ShoeSVG />}
      </div>
      <div className="equip-body">
        <div className="flex-between">
          <div>
            <div className="equip-name">
              {e.brand} {e.name}
            </div>
            <div className="equip-meta">
              {e.type === 'Raquette' ? `${e.weight}g · ${e.shape}` : `Taille ${e.size}`}
            </div>
          </div>
          {e.primary && (
            <span
              className="tag"
              style={{ background: 'color-mix(in srgb, var(--accent) 18%, transparent)', color: 'var(--accent)' }}
            >
              Actif
            </span>
          )}
        </div>
        <div className="wear-bar">
          <div className={`wear-fill ${wearClass(e)}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="wear-row">
          <span>
            {e.hours.toFixed(1)}h / {e.hoursMax}h
          </span>
          <span className="pct">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const router = useRouter();
  const { openModal } = useShell();
  const { equipment } = useStore();
  const rackets = equipment.filter((e) => e.type === 'Raquette');
  const shoes = equipment.filter((e) => e.type === 'Chaussures');
  const alerts = equipment.filter((e) => wearPct(e) > 80);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Matériel</div>
          <h1 className="page-title">Mon équipement</h1>
          <div className="page-sub">
            {equipment.length} pièces · {alerts.length} à surveiller
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('add-equipment')}>
          <Icon name="plus" size={14} /> Ajouter
        </button>
      </div>

      <div className="section" style={{ marginTop: 8 }}>
        <div className="section-head">
          <h2 className="section-title">Raquettes</h2>
        </div>
        <div className="equip-grid">
          {rackets.map((e) => (
            <EquipCard key={e.id} e={e} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Chaussures</h2>
        </div>
        <div className="equip-grid">
          {shoes.map((e) => (
            <EquipCard key={e.id} e={e} />
          ))}
        </div>
      </div>

      {alerts.map((e) => (
        <div
          key={e.id}
          className="alert"
          onClick={() => router.push(`/equipment/${e.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="ico">
            <Icon name="alert" size={18} />
          </div>
          <div>
            <b>
              {e.brand} {e.name} — {wearPct(e)}% d&apos;usure
            </b>
            Performance dégradée probable. Pense à un remplacement avant les prochains tournois.
          </div>
        </div>
      ))}
    </>
  );
}
