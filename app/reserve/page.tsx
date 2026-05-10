'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { useShell } from '@/components/AppShell';

const SLOTS = [
  { time: '09:00', court: '1', taken: false },
  { time: '10:00', court: '2', taken: true },
  { time: '11:00', court: '3', taken: false },
  { time: '14:00', court: '1', taken: false },
  { time: '15:00', court: '4', taken: true },
  { time: '16:00', court: '2', taken: false },
  { time: '18:00', court: '5', taken: false },
  { time: '19:00', court: '3', taken: false },
  { time: '20:00', court: '1', taken: true },
  { time: '21:00', court: '4', taken: false },
];

export default function ReservePage() {
  const router = useRouter();
  const { showToast } = useShell();
  const { bookSlot } = useStore();
  const [date, setDate] = useState('2026-05-09');
  const [selected, setSelected] = useState<number | null>(null);
  const [partners, setPartners] = useState('');

  const confirm = () => {
    if (selected === null) return;
    const slot = SLOTS[selected];
    bookSlot({
      date,
      time: slot.time,
      partners: partners || 'À compléter',
      venue: 'Club du Parc',
      court: slot.court,
      weather: '17° ⛅',
    });
    showToast(`Créneau ${slot.time} réservé`);
    router.push('/calendar');
  };

  return (
    <>
      <button className="detail-back" onClick={() => router.push('/calendar')}>
        <Icon name="back" size={16} /> Calendrier
      </button>

      <div className="page-head">
        <div>
          <div className="eyebrow">Réservation</div>
          <h1 className="page-title">Trouve ton créneau</h1>
          <div className="page-sub">Club du Parc · 5 courts disponibles</div>
        </div>
      </div>

      <div className="card">
        <div className="modal-row" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Date</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Partenaires</label>
            <input
              className="input"
              placeholder="Jules, Sam, Théo"
              value={partners}
              onChange={(e) => setPartners(e.target.value)}
            />
          </div>
        </div>

        <div className="eyebrow mt-16">Créneaux disponibles</div>
        <div className="slot-grid mt-12">
          {SLOTS.map((s, i) => (
            <div
              key={i}
              className={`slot ${s.taken ? 'taken' : ''} ${selected === i ? 'selected' : ''}`}
              onClick={() => !s.taken && setSelected(i)}
            >
              <div className="h">{s.time}</div>
              <div className="court">
                Court {s.court}
                {s.taken ? ' · pris' : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={() => router.push('/calendar')}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            disabled={selected === null}
            onClick={confirm}
            style={selected === null ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            Réserver
          </button>
        </div>
      </div>
    </>
  );
}
