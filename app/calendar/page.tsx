'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useStore, MONTHS_FR } from '@/lib/store';

export default function CalendarPage() {
  const router = useRouter();
  const { matches, upcoming } = useStore();

  const month = new Date(2026, 4, 1);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = 7;

  const cells: { d: number; muted?: boolean }[] = [];
  for (let i = 0; i < startDay; i++) cells.push({ muted: true, d: 30 - startDay + i + 1 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d });
  while (cells.length < 42) cells.push({ muted: true, d: cells.length - daysInMonth - startDay + 1 });

  const eventsByDay: Record<number, { kind: string; time?: string }[]> = {};
  matches.forEach((m) => {
    const d = new Date(m.date);
    if (d.getMonth() === month.getMonth()) {
      const k = d.getDate();
      eventsByDay[k] = eventsByDay[k] || [];
      eventsByDay[k].push({ kind: m.result === 'lesson' ? 'lesson' : 'past' });
    }
  });
  upcoming.forEach((u) => {
    const d = new Date(u.date);
    if (d.getMonth() === month.getMonth()) {
      const k = d.getDate();
      eventsByDay[k] = eventsByDay[k] || [];
      eventsByDay[k].push({ kind: 'future', time: u.time });
    }
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Calendrier</div>
          <h1 className="page-title">Mai 2026</h1>
          <div className="page-sub">{upcoming.length} matchs à venir cette semaine</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">
            <Icon name="calendar" size={14} /> Synchroniser
          </button>
          <button className="btn btn-primary" onClick={() => router.push('/reserve')}>
            <Icon name="plus" size={14} /> Réserver
          </button>
        </div>
      </div>

      <div className="card">
        <div className="calendar">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <div key={d} className="cal-head">
              {d}
            </div>
          ))}
          {cells.map((c, i) => {
            const evs = !c.muted ? eventsByDay[c.d] || [] : [];
            return (
              <div
                key={i}
                className={`cal-cell ${c.muted ? 'muted' : ''} ${!c.muted && c.d === today ? 'today' : ''}`}
              >
                <span className="d">{c.d}</span>
                <div className="events">
                  {evs.slice(0, 2).map((e, j) => (
                    <div
                      key={j}
                      className={`cal-event ${e.kind === 'lesson' ? 'lesson' : e.kind === 'past' ? 'past' : ''}`}
                    >
                      {e.time || 'Match'}
                    </div>
                  ))}
                </div>
                <div className="dots">
                  {evs.slice(0, 3).map((e, j) => (
                    <span
                      key={j}
                      className={`cal-dot ${e.kind === 'lesson' ? 'lesson' : e.kind === 'past' ? 'past' : ''}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">À venir</h2>
        </div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {upcoming.map((u) => {
            const d = new Date(u.date);
            return (
              <div key={u.id} className="match-row">
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
                <span className="match-score">{u.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Historique récent</h2>
        </div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {matches.slice(0, 5).map((m) => {
            const d = new Date(m.date);
            return (
              <div
                key={m.id}
                className="match-row"
                onClick={() => router.push(`/match/${m.id}`)}
              >
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
                  <span className="tag">
                    {m.result === 'lesson' ? 'Cours' : m.result === 'win' ? 'Victoire' : 'Défaite'}
                  </span>
                </div>
                <span className={`match-score ${m.result === 'win' ? 'win' : m.result === 'loss' ? 'loss' : ''}`}>
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
