import type { AppState } from './types';

export const DEFAULT_STATE: AppState = {
  theme: 'court',
  user: { name: 'Alex', initials: 'A', level: 7 },
  matches: [
    { id: 'm1', date: '2026-05-06', duration: 1.5, partners: 'Jules', opponents: 'Théo & Sam', score: '6-3, 6-4', result: 'win', venue: 'Club du Parc', court: '3', racket: 'r1', shoes: 's1' },
    { id: 'm2', date: '2026-05-04', duration: 2, partners: 'Léa', opponents: 'Marc & Inès', score: '4-6, 6-3, 5-7', result: 'loss', venue: 'Padel Indoor', court: '1', racket: 'r1', shoes: 's1' },
    { id: 'm3', date: '2026-05-01', duration: 1.25, partners: 'Jules', opponents: 'Karim & Théo', score: '6-2, 6-4', result: 'win', venue: 'Club du Parc', court: '5', racket: 'r1', shoes: 's1' },
    { id: 'm4', date: '2026-04-28', duration: 1, partners: 'Coach Pablo', opponents: '—', score: 'Technique', result: 'lesson', venue: 'Padel Indoor', court: '2', racket: 'r2', shoes: 's2' },
    { id: 'm5', date: '2026-04-27', duration: 1.75, partners: 'Sam', opponents: 'Lucas & Inès', score: '6-4, 7-5', result: 'win', venue: 'Club du Parc', court: '4', racket: 'r1', shoes: 's1' },
  ],
  upcoming: [
    { id: 'u1', date: '2026-05-08', time: '19:30', partners: 'Jules, Théo, Sam', venue: 'Club du Parc', court: '3', weather: '18° ☀' },
    { id: 'u2', date: '2026-05-10', time: '10:00', partners: 'Cours · Coach Pablo', venue: 'Padel Indoor', court: '1', weather: 'Indoor' },
    { id: 'u3', date: '2026-05-11', time: '20:00', partners: 'Léa, Marc, Inès', venue: 'Club du Parc', court: '5', weather: '16° ⛅' },
  ],
  equipment: [
    { id: 'r1', type: 'Raquette', brand: 'Bullpadel', name: 'Vertex 04', weight: 375, shape: 'Boucle', purchased: '2026-02-12', price: 289, hours: 62, hoursMax: 120, primary: true },
    { id: 'r2', type: 'Raquette', brand: 'Nox', name: 'AT10 Genius', weight: 365, shape: 'Larme', purchased: '2025-10-04', price: 249, hours: 95, hoursMax: 120, primary: false },
    { id: 's1', type: 'Chaussures', brand: 'Asics', name: 'Gel-Padel Pro 5', size: '43', purchased: '2026-03-18', price: 149, hours: 48, hoursMax: 100, primary: true },
    { id: 's2', type: 'Chaussures', brand: 'Adidas', name: 'Barricade', size: '43', purchased: '2025-11-22', price: 129, hours: 88, hoursMax: 100, primary: false },
  ],
};
