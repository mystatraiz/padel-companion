'use client';

import { useState } from 'react';
import { Icon } from '../Icon';
import { useStore } from '@/lib/store';

interface Props {
  close: () => void;
  toast: (msg: string) => void;
}

export function AddMatchModal({ close, toast }: Props) {
  const { equipment, addMatch } = useStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    duration: 1.5,
    partners: '',
    opponents: '',
    score: '',
    result: 'win' as 'win' | 'loss' | 'lesson',
    venue: 'Club du Parc',
    court: '1',
    racket: equipment.find((e) => e.type === 'Raquette' && e.primary)?.id || equipment.find((e) => e.type === 'Raquette')?.id || '',
    shoes: equipment.find((e) => e.type === 'Chaussures' && e.primary)?.id || equipment.find((e) => e.type === 'Chaussures')?.id || '',
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.partners || !form.score) {
      alert('Renseigne au minimum partenaires et score');
      return;
    }
    addMatch({ ...form, duration: Number(form.duration) });
    toast('Match ajouté · matériel mis à jour');
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-12">
          <h3>Nouveau match</h3>
          <button className="btn btn-icon btn-ghost" onClick={close}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <p>Renseigne les détails — l&apos;usure du matériel s&apos;incrémente automatiquement.</p>

        <div className="modal-row">
          <div className="field">
            <label>Date</label>
            <input className="input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label>Durée (h)</label>
            <input className="input" type="number" step="0.25" min="0.5" max="6" value={form.duration}
              onChange={(e) => set('duration', parseFloat(e.target.value))} />
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Partenaire(s)</label>
            <input className="input" placeholder="Jules" value={form.partners} onChange={(e) => set('partners', e.target.value)} />
          </div>
          <div className="field">
            <label>Adversaires</label>
            <input className="input" placeholder="Théo & Sam" value={form.opponents} onChange={(e) => set('opponents', e.target.value)} />
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Score</label>
            <input className="input" placeholder="6-3, 6-4" value={form.score} onChange={(e) => set('score', e.target.value)} />
          </div>
          <div className="field">
            <label>Résultat</label>
            <select className="input" value={form.result} onChange={(e) => set('result', e.target.value as 'win' | 'loss' | 'lesson')}>
              <option value="win">Victoire</option>
              <option value="loss">Défaite</option>
              <option value="lesson">Cours</option>
            </select>
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Club</label>
            <input className="input" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
          </div>
          <div className="field">
            <label>Court</label>
            <input className="input" value={form.court} onChange={(e) => set('court', e.target.value)} />
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Raquette</label>
            <select className="input" value={form.racket} onChange={(e) => set('racket', e.target.value)}>
              {equipment.filter((e) => e.type === 'Raquette').map((e) => (
                <option key={e.id} value={e.id}>{e.brand} {e.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Chaussures</label>
            <select className="input" value={form.shoes} onChange={(e) => set('shoes', e.target.value)}>
              {equipment.filter((e) => e.type === 'Chaussures').map((e) => (
                <option key={e.id} value={e.id}>{e.brand} {e.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={close}>Annuler</button>
          <button className="btn btn-primary" onClick={submit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
