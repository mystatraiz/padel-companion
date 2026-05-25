'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Match, MatchInput, Equipment, EquipmentInput, Theme, UpcomingMatch, User, FastingSession, WeightEntry } from './types';
import { DEFAULT_STATE } from './defaults';
import {
  fsSetMatch, fsSetEquipment, fsSetEquipmentBatch,
  fsDeleteEquipment, fsSetUpcoming, fsDeleteUpcoming,
  fsSetFasting, fsDeleteFasting, fsSetWeight, fsDeleteWeight,
} from './firestore';

// ─── Store shape ──────────────────────────────────────────────────────────────

interface StoreActions {
  setUid:          (uid: string | null) => void;
  setUser:         (user: User) => void;
  setMatches:      (m: Match[]) => void;
  setEquipment:    (e: Equipment[]) => void;
  setUpcoming:     (u: UpcomingMatch[]) => void;
  setFasting:      (s: FastingSession[]) => void;
  setWeightEntries:(w: WeightEntry[]) => void;

  setTheme:        (theme: Theme) => void;
  addMatch:        (match: MatchInput) => void;
  addEquipment:    (item: EquipmentInput) => void;
  setPrimary:      (id: string) => void;
  deleteEquipment: (id: string) => void;
  bookSlot:        (slot: Omit<UpcomingMatch, 'id'>) => void;
  cancelUpcoming:  (id: string) => void;
  startFast:       (targetHours: number) => void;
  stopFast:        () => void;
  editFast:        (id: string, updates: Partial<FastingSession>) => void;
  deleteFast:      (id: string) => void;
  logWeight:       (weight: number, date?: string) => void;
  deleteWeight:    (id: string) => void;
  reset:           () => void;
}

interface StoreState extends AppState {
  uid: string | null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      uid: null,
      ...DEFAULT_STATE,

      setUid:          (uid)            => set({ uid }),
      setUser:         (user)           => set({ user }),
      setMatches:      (matches)        => set({ matches }),
      setEquipment:    (equipment)      => set({ equipment }),
      setUpcoming:     (upcoming)       => set({ upcoming }),
      setFasting:      (fastingSessions)=> set({ fastingSessions }),
      setWeightEntries:(weightEntries)  => set({ weightEntries }),

      setTheme: (theme) => set({ theme }),

      addMatch: (match) =>
        set((s) => {
          const id = 'm' + Date.now();
          const newMatch: Match = { ...match, id };
          const equipment = s.equipment.map((e) => {
            if (e.id === match.racket || e.id === match.shoes) {
              const updated = { ...e, hours: Math.min(e.hoursMax, e.hours + match.duration) };
              if (s.uid) fsSetEquipment(s.uid, updated).catch(() => {});
              return updated;
            }
            return e;
          });
          if (s.uid) fsSetMatch(s.uid, newMatch).catch(() => {});
          return { matches: [newMatch, ...s.matches], equipment };
        }),

      addEquipment: (item) =>
        set((s) => {
          const id = (item.type === 'Raquette' ? 'r' : 's') + Date.now();
          const eq: Equipment = { ...item, id, hours: 0 };
          if (s.uid) fsSetEquipment(s.uid, eq).catch(() => {});
          return { equipment: [...s.equipment, eq] };
        }),

      setPrimary: (id) =>
        set((s) => {
          const target = s.equipment.find((e) => e.id === id);
          if (!target) return s;
          const equipment = s.equipment.map((e) =>
            e.type === target.type ? { ...e, primary: e.id === id } : e
          );
          if (s.uid) fsSetEquipmentBatch(s.uid, equipment).catch(() => {});
          return { equipment };
        }),

      deleteEquipment: (id) =>
        set((s) => {
          if (s.uid) fsDeleteEquipment(s.uid, id).catch(() => {});
          return { equipment: s.equipment.filter((e) => e.id !== id) };
        }),

      bookSlot: (slot) =>
        set((s) => {
          const id = 'u' + Date.now();
          const entry: UpcomingMatch = { ...slot, id };
          if (s.uid) fsSetUpcoming(s.uid, entry).catch(() => {});
          return { upcoming: [...s.upcoming, entry] };
        }),

      cancelUpcoming: (id) =>
        set((s) => {
          if (s.uid) fsDeleteUpcoming(s.uid, id).catch(() => {});
          return { upcoming: s.upcoming.filter((u) => u.id !== id) };
        }),

      startFast: (targetHours) =>
        set((s) => {
          if (s.fastingSessions.some((f) => !f.endTime)) return s;
          const session: FastingSession = {
            id: 'fast' + Date.now(), startTime: new Date().toISOString(), targetHours, completed: false,
          };
          if (s.uid) fsSetFasting(s.uid, session).catch(() => {});
          return { fastingSessions: [session, ...s.fastingSessions] };
        }),

      stopFast: () =>
        set((s) => {
          const active = s.fastingSessions.find((f) => !f.endTime);
          if (!active) return s;
          const endTime   = new Date().toISOString();
          const elapsed   = (Date.now() - new Date(active.startTime).getTime()) / 3_600_000;
          const completed = elapsed >= active.targetHours;
          const updated: FastingSession = { ...active, endTime, completed };
          if (s.uid) fsSetFasting(s.uid, updated).catch(() => {});
          return { fastingSessions: s.fastingSessions.map((f) => f.id === active.id ? updated : f) };
        }),

      editFast: (id, updates) =>
        set((s) => {
          const session = s.fastingSessions.find((f) => f.id === id);
          if (!session) return s;
          const merged = { ...session, ...updates };
          // Recompute completed if times changed
          if (merged.endTime) {
            const elapsed = (new Date(merged.endTime).getTime() - new Date(merged.startTime).getTime()) / 3_600_000;
            merged.completed = elapsed >= merged.targetHours;
          } else {
            merged.completed = false;
          }
          if (s.uid) fsSetFasting(s.uid, merged).catch(() => {});
          return { fastingSessions: s.fastingSessions.map((f) => f.id === id ? merged : f) };
        }),

      deleteFast: (id) =>
        set((s) => {
          if (s.uid) fsDeleteFasting(s.uid, id).catch(() => {});
          return { fastingSessions: s.fastingSessions.filter((f) => f.id !== id) };
        }),

      logWeight: (weight, date) =>
        set((s) => {
          const today = date ?? new Date().toISOString().slice(0, 10);
          // Remplace l'entrée du jour si elle existe déjà
          const existing = s.weightEntries.find((w) => w.date === today);
          if (existing) {
            const updated: WeightEntry = { ...existing, weight };
            if (s.uid) fsSetWeight(s.uid, updated).catch(() => {});
            return { weightEntries: s.weightEntries.map((w) => w.id === existing.id ? updated : w) };
          }
          const entry: WeightEntry = { id: 'w' + Date.now(), date: today, weight };
          if (s.uid) fsSetWeight(s.uid, entry).catch(() => {});
          return { weightEntries: [entry, ...s.weightEntries] };
        }),

      deleteWeight: (id) =>
        set((s) => {
          if (s.uid) fsDeleteWeight(s.uid, id).catch(() => {});
          return { weightEntries: s.weightEntries.filter((w) => w.id !== id) };
        }),

      reset: () => set({ ...DEFAULT_STATE, uid: get().uid }),
    }),
    {
      name: 'padel-pulse-v2',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const wearPct   = (e: Equipment) => Math.round((e.hours / e.hoursMax) * 100);
export const wearClass = (e: Equipment) => {
  const pct = wearPct(e);
  return pct > 80 ? 'bad' : pct > 60 ? 'warn' : '';
};

export const MONTHS_FR = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];

export function fastingStreaks(sessions: FastingSession[]) {
  const completed = sessions.filter((s) => s.completed && s.endTime);
  if (!completed.length) return { current: 0, best: 0 };
  const days = [...new Set(completed.map((s) => s.endTime!.slice(0, 10)))].sort();
  let cur = 1, best = 1;
  const perDay: number[] = [1];
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) / 86_400_000);
    cur = diff === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    perDay.push(cur);
  }
  const last      = days[days.length - 1];
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return { current: (last === today || last === yesterday) ? perDay[perDay.length - 1] : 0, best };
}
