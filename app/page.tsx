'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Ring } from '@/components/Ring';
import { useStore, wearPct, MONTHS_FR } from '@/lib/store';
import { useShell } from '@/components/AppShell';

export default function Dashboard() {
  const router = useRouter();
  const { openModal, showToast } = useShell();
  const { matches, upcoming, equipment, user } = useStore();

  const totalHours = matches.reduce((s, m) => s + m.duration, 0);
  const wins = matches.filter((m) => m.result === 'win').length;
  const losses = matches.filter((m) => m.result === 'loss').length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const calories = Math.round(totalHours * 580);
  const weekly = [4, 2, 5.5, 3, 6, 4.5, 7];
  const max = Math.max(...weekly);
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const alertItem = equipment.find((e) => wearPct(e) > 80);

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">{dateStr}</div>
          <h1 className="page-title">Salut {user.name.split(' ')[0]}</h1>
          <div className="page-sub">Tu enchaînes la 5e semaine de jeu — solide.</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('add-match')}>
          <Icon name="plus" size={14} /> Ajouter un match
        </button>
      </div>

      <div className="hero">
        <div className="hero-coach">
          <div className="eyebrow">Coach du jour</div>
          <h2>
            Plus que <span className="num">2h15</span> pour battre ta semaine record.
          </h2>
          <p>
            Tu joues plus régulièrement et ça paye : ton taux de victoires monte de 8 points ce mois-ci.
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => router.push('/calendar')}>
              Voir mes matchs
            </button>
            <button className="btn" onClick={() => router.push('/reserve')}>
              Réserver un créneau
            </button>
          </div>
        </div>

        <div className="card streak">
          <Ring value={5} max={7} label="5" sublabel="Jours d'affilée" />
          <div
            className="mt-12"
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-soft)', fontSize: 13 }}
          >
            <Icon name="flame" size={16} /> Série en cours
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Heures · Mois</div>
          <div className="value">
            {totalHours.toFixed(1)}
            <span className="unit">h</span>
          </div>
          <div className="delta">
            <Icon name="trend-up" size={11} /> +18% vs avril
          </div>
        </div>
        <div className="kpi">
          <div className="label">Matchs joués</div>
          <div className="value">{matches.length}</div>
          <div className="delta">
            <Icon name="trend-up" size={11} /> +3 vs avril
          </div>
        </div>
        <div className="kpi">
          <div className="label">Win rate</div>
          <div className="value">
            {winRate}
            <span className="unit">%</span>
          </div>
          <div className="delta">
            <Icon name="trend-up" size={11} /> +8 pts
          </div>
        </div>
        <div className="kpi">
          <div className="label">Calories</div>
          <div className="value">
            {(calories / 1000).toFixed(1)}
            <span className="unit">k</span>
          </div>
          <div className="delta">
            <Icon name="trend-up" size={11} /> ~580/h
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Volume hebdomadaire</h2>
          <div className="weather-pill">
            <Icon name="clock" size={11} /> 32h sur 7 jours
          </div>
        </div>
        <div className="card">
          <div className="bar-chart">
            {weekly.map((v, i) => (
              <div
                key={i}
                className={`bar ${i === 6 ? 'active' : ''}`}
                style={{ height: `${(v / max) * 100}%` }}
              >
                <span className="bar-value num">{v}h</span>
                <span className="bar-label">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Prochains matchs</h2>
          <button className="section-link" onClick={() => router.push('/calendar')}>
            Tout voir →
          </button>
        </div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {upcoming.slice(0, 3).map((u) => {
            const d = new Date(u.date);
            return (
              <div key={u.id} className="match-row" onClick={() => router.push('/calendar')}>
                <div className="match-date">
                  <div className="day">{d.getDate()}</div>
                  <div className="mon">{MONTHS_FR[d.getMonth()]}</div>
                </div>
                <div className="match-info">
                  <div className="partners">{u.partners}</div>
                  <div className="meta">
                    {u.time} · {u.venue} · Court {u.court}
                  </div>
                </div>
                <div className="tag-col">
                  <span className="weather-pill">{u.weather}</span>
                </div>
                <button
                  className="btn btn-icon btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('Rappel activé');
                  }}
                >
                  <Icon name="bell" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {alertItem && (
        <div
          className="alert"
          onClick={() => router.push(`/equipment/${alertItem.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="ico">
            <Icon name="alert" size={18} />
          </div>
          <div>
            <b>
              {alertItem.brand} {alertItem.name}
            </b>
            Niveau d&apos;usure à {wearPct(alertItem)}% — pense à prévoir un remplacement.
          </div>
        </div>
      )}
    </>
  );
}
