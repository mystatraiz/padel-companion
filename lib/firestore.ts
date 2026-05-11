'use client';

import {
  doc, collection, setDoc, deleteDoc, getDoc,
  onSnapshot, query, orderBy, writeBatch,
} from 'firebase/firestore';
import { getDB } from './firebase';
import type { Match, Equipment, UpcomingMatch } from './types';
import { DEFAULT_STATE } from './defaults';

// ─── Collection references (lazy — db only resolved at call time) ─────────────

const userDoc     = (uid: string) => doc(getDB(), 'users', uid);
const matchesCol  = (uid: string) => collection(getDB(), 'users', uid, 'matches');
const equipCol    = (uid: string) => collection(getDB(), 'users', uid, 'equipment');
const upcomingCol = (uid: string) => collection(getDB(), 'users', uid, 'upcoming');

// ─── New-user detection ──────────────────────────────────────────────────────

export async function isNewUser(uid: string): Promise<boolean> {
  const snap = await getDoc(userDoc(uid));
  return !snap.exists();
}

// ─── Seed default data (first login) ────────────────────────────────────────

export async function seedDefaultData(uid: string, displayName: string | null) {
  const batch = writeBatch(getDB());

  batch.set(userDoc(uid), {
    displayName,
    createdAt: new Date().toISOString(),
  });

  DEFAULT_STATE.matches.forEach((m) =>
    batch.set(doc(matchesCol(uid), m.id), m)
  );
  DEFAULT_STATE.equipment.forEach((e) =>
    batch.set(doc(equipCol(uid), e.id), e)
  );
  DEFAULT_STATE.upcoming.forEach((u) =>
    batch.set(doc(upcomingCol(uid), u.id), u)
  );

  await batch.commit();
}

// ─── Write helpers ────────────────────────────────────────────────────────────

export const fsSetMatch        = (uid: string, m: Match)         => setDoc(doc(matchesCol(uid), m.id), m);
export const fsDeleteMatch     = (uid: string, id: string)       => deleteDoc(doc(matchesCol(uid), id));
export const fsSetEquipment    = (uid: string, e: Equipment)     => setDoc(doc(equipCol(uid), e.id), e);
export const fsDeleteEquipment = (uid: string, id: string)       => deleteDoc(doc(equipCol(uid), id));
export const fsSetUpcoming     = (uid: string, u: UpcomingMatch) => setDoc(doc(upcomingCol(uid), u.id), u);
export const fsDeleteUpcoming  = (uid: string, id: string)       => deleteDoc(doc(upcomingCol(uid), id));

export async function fsSetEquipmentBatch(uid: string, items: Equipment[]) {
  const batch = writeBatch(getDB());
  items.forEach((e) => batch.set(doc(equipCol(uid), e.id), e));
  await batch.commit();
}

// ─── Real-time subscription ──────────────────────────────────────────────────

export function subscribeUserData(
  uid: string,
  onMatches:   (m: Match[])         => void,
  onEquipment: (e: Equipment[])     => void,
  onUpcoming:  (u: UpcomingMatch[]) => void,
): () => void {
  const u1 = onSnapshot(
    query(matchesCol(uid), orderBy('date', 'desc')),
    (snap) => onMatches(snap.docs.map((d) => d.data() as Match)),
  );
  const u2 = onSnapshot(
    equipCol(uid),
    (snap) => onEquipment(snap.docs.map((d) => d.data() as Equipment)),
  );
  const u3 = onSnapshot(
    query(upcomingCol(uid), orderBy('date', 'asc'), orderBy('time', 'asc')),
    (snap) => onUpcoming(snap.docs.map((d) => d.data() as UpcomingMatch)),
  );

  return () => { u1(); u2(); u3(); };
}
