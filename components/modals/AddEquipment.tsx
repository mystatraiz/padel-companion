'use client';

import { useState } from 'react';
import { Icon } from '../Icon';
import { useStore } from '@/lib/store';

interface Props {
  close: () => void;
  toast: (msg: string) => void;
}

export function AddEquipmentModal({ close, toast }: Props) {
  const { addEquipment } = useStore();
  const [form, setForm] = useState({
    type: 'Raquette' as 'Raquette' | 'Chaussures',
    brand: '',
    name: '',
    weight: 370,
    shape: 'Larme' as 'Larme' | 'Ronde' | 'Boucle',
    size: '43',
    purchased: new Date().toISOString().slice(0, 10),
    price: 250,
    hoursMax: 120,
    primary: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.brand || !form.name) {
      alert('Marque et modèle requis');
      return;
    }
    addEquipment({ ...form, hoursMax: form.type === 'Raquette' ? 120 : 100 });
    toast(`${form.brand} ${form.name} ajouté`);
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-12">
          <h3>Nouveau matériel</h3>
          <button className="btn btn-icon btn-ghost" onClick={close}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <p>Suis l&apos;usure dès le premier match.</p>

        <div className="modal-row">
          <div className="field">
            <label>Type</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value as 'Raquette' | 'Chaussures')}>
              <option>Raquette</option>
              <option>Chaussures</option>
            </select>
          </div>
          <div className="field">
            <label>Marque</label>
            <input className="input" placeholder="Bullpadel" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          </div>
        </div>
        <div className="modal-row">
          <div className="field">
            <label>Modèle</label>
            <input className="input" placeholder="Vertex 04" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Date d&apos;achat</label>
            <input className="input" type="date" value={form.purchased} onChange={(e) => set('purchased', e.target.value)} />
          </div>
        </div>

        {form.type === 'Raquette' ? (
          <>
            <div className="modal-row">
              <div className="field">
                <label>Poids (g)</label>
                <input className="input" type="number" value={form.weight} onChange={(e) => set('weight', parseInt(e.target.value))} />
              </div>
              <div className="field">
                <label>Forme</label>
                <select className="input" value={form.shape} onChange={(e) => set('shape', e.target.value as 'Larme' | 'Ronde' | 'Boucle')}>
                  <option>Larme</option>
                  <option>Ronde</option>
                  <option>Boucle</option>
                </select>
              </div>
            </div>
            <div className="field mb-12">
              <label>Prix (€)</label>
              <input className="input" type="number" value={form.price} onChange={(e) => set('price', parseInt(e.target.value))} />
            </div>
          </>
        ) : (
          <div className="modal-row">
            <div className="field">
              <label>Taille</label>
              <input className="input" value={form.size} onChange={(e) => set('size', e.target.value)} />
            </div>
            <div className="field">
              <label>Prix (€)</label>
              <input className="input" type="number" value={form.price} onChange={(e) => set('price', parseInt(e.target.value))} />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={close}>Annuler</button>
          <button className="btn btn-primary" onClick={submit}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}
