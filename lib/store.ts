'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Match, MatchInput, Equipment, EquipmentInput, Theme, UpcomingMatch, User } from './types';
import { DEFAULT_STATE } from './defaults';
import {
  fsSetMatch, fsSetEquipment, fsSetEquipmentBatch,
  fsDeleteEquipment, fsSetUpcoming, fsDeleteUpcoming,
} from './firestore';

// ─── Store shape ──────────────────────────────────────────────────────────────

interface StoreActions {
  setUid:       (uid: string | null) => void;
  setUser:      (user: User) => void;
  setMatches:   (m: Match[]) => void;
  setEquipment: (e: Equipment[]) => void;
  setUpcoming:  (u: UpcomingMatch[]) => void;

  setTheme:        (theme: Theme) => void;
  addMatch:        (match: MatchInput) => void;
  addEquipment:    (item: EquipmentInput) => void;
  setPrimary:      (id: string) => void;
  deleteEquipment: (id: string) => void;
  bookSlot:        (slot: Omit<UpcomingMatch, 'id'>) => void;
  cancelUpcoming:  (id: string) => void;
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

      setUid:       (uid)       => set({ uid }),
      setUser:      (user)      => set({ user }),
      setMatches:   (matches)   => set({ matches }),
      setEquipment: (equipment) => set({ equipment }),
      setUpcoming:  (upcoming)  => set({ upcoming }),

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
