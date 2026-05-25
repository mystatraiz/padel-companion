'use client';

import {
  doc, collection, setDoc, deleteDoc, getDoc,
  onSnapshot, writeBatch,
} from 'firebase/firestore';
import { getDB } from './firebase';
import type { Match, Equipment, UpcomingMatch, User, FastingSession, WeightEntry } from './types';
import { DEFAULT_STATE } from './defaults';

// ─── Collection references ────────────────────────────────────────────────────

const userDoc     = (uid: string) => doc(getDB(), 'users', uid);
const matchesCol  = (uid: string) => collection(getDB(), 'users', uid, 'matches');
const equipCol    = (uid: string) => collection(getDB(), 'users', uid, 'equipment');
const upcomingCol = (uid: string) => collection(getDB(), 'users', uid, 'upcoming');
const fastingCol  = (uid: string) => collection(getDB(), 'users', uid, 'fasting');
const weightCol   = (uid: string) => collection(getDB(), 'users', uid, 'weight');

// ─── Setup status ─────────────────────────────────────────────────────────────

export async function getUserSetupStatus(uid: string): Promise<{
  isNew: boolean;
  profileComplete: boolean;
  profile: Partial<User> | null;
}> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return { isNew: true, profileComplete: false, profile: null };
  const data = snap.data();
  return {
    isNew: false,
    profileComplete: !!data?.profileComplete,
    profile: data?.profileComplete ? (data as Partial<User>) : null,
  };
}

// ─── Seed default data ────────────────────────────────────────────────────────

export async function seedDefaultData(uid: string, displayName: string | null) {
  const batch = writeBatch(getDB());
  batch.set(userDoc(uid), { displayName, createdAt: new Date().toISOString(), profileComplete: false });
  DEFAULT_STATE.matches.forEach((m)   => batch.set(doc(matchesCol(uid),  m.id), m));
  DEFAULT_STATE.equipment.forEach((e) => batch.set(doc(equipCol(uid),    e.id), e));
  DEFAULT_STATE.upcoming.forEach((u)  => batch.set(doc(upcomingCol(uid), u.id), u));
  await batch.commit();
}

// ─── Save user profile ────────────────────────────────────────────────────────

export async function saveUserProfile(uid: string, data: {
  firstName: string; lastName: string; nickname: string; level: number;
  dominantHand: 'left' | 'right'; preferredSide: 'left' | 'right'; phone: string;
}) {
  await setDoc(userDoc(uid), { ...data, profileComplete: true }, { merge: true });
}

// ─── Clear all user data ──────────────────────────────────────────────────────

export async function fsClearUserData(uid: string) {
  const { getDocs } = await import('firebase/firestore');
  const cols = [matchesCol(uid), equipCol(uid), upcomingCol(uid), fastingCol(uid), weightCol(uid)];
  for (const col of cols) {
    const snap = await getDocs(col);
    const batch = writeBatch(getDB());
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// ─── Write helpers ────────────────────────────────────────────────────────────

export const fsSetMatch        = (uid: string, m: Match)          => setDoc(doc(matchesCol(uid),  m.id), m);
export const fsDeleteMatch     = (uid: string, id: string)        => deleteDoc(doc(matchesCol(uid), id));
export const fsSetEquipment    = (uid: string, e: Equipment)      => setDoc(doc(equipCol(uid),    e.id), e);
export const fsDeleteEquipment = (uid: string, id: string)        => deleteDoc(doc(equipCol(uid),  id));
export const fsSetUpcoming     = (uid: string, u: UpcomingMatch)  => setDoc(doc(upcomingCol(uid), u.id), u);
export const fsDeleteUpcoming  = (uid: string, id: string)        => deleteDoc(doc(upcomingCol(uid), id));
export const fsSetFasting      = (uid: string, s: FastingSession) => setDoc(doc(fastingCol(uid),  s.id), s);
export const fsDeleteFasting   = (uid: string, id: string)        => deleteDoc(doc(fastingCol(uid), id));
export const fsSetWeight       = (uid: string, w: WeightEntry)    => setDoc(doc(weightCol(uid),   w.id), w);
export const fsDeleteWeight    = (uid: string, id: string)        => deleteDoc(doc(weightCol(uid), id));

export async function fsSetEquipmentBatch(uid: string, items: Equipment[]) {
  const batch = writeBatch(getDB());
  items.forEach((e) => batch.set(doc(equipCol(uid), e.id), e));
  await batch.commit();
}

// ─── Real-time subscriptions ──────────────────────────────────────────────────

export function subscribeUserData(
  uid: string,
  onMatches:   (m: Match[])         => void,
  onEquipment: (e: Equipment[])     => void,
  onUpcoming:  (u: UpcomingMatch[]) => void,
): () => void {
  const u1 = onSnapshot(matchesCol(uid),
    (snap) => onMatches(snap.docs.map((d) => d.data() as Match).sort((a, b) => b.date.localeCompare(a.date))),
    () => onMatches([]),
  );
  const u2 = onSnapshot(equipCol(uid),
    (snap) => onEquipment(snap.docs.map((d) => d.data() as Equipment)),
    () => onEquipment([]),
  );
  const u3 = onSnapshot(upcomingCol(uid),
    (snap) => onUpcoming(
      snap.docs.map((d) => d.data() as UpcomingMatch)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    ),
    () => onUpcoming([]),
  );
  return () => { u1(); u2(); u3(); };
}

export function subscribeFasting(uid: string, onFasting: (s: FastingSession[]) => void): () => void {
  return onSnapshot(
    fastingCol(uid),
    (snap) => onFasting(snap.docs.map((d) => d.data() as FastingSession).sort((a, b) => b.startTime.localeCompare(a.startTime))),
    () => onFasting([]),
  );
}

export function subscribeWeight(uid: string, onWeight: (w: WeightEntry[]) => void): () => void {
  return onSnapshot(
    weightCol(uid),
    (snap) => onWeight(snap.docs.map((d) => d.data() as WeightEntry).sort((a, b) => b.date.localeCompare(a.date))),
    () => onWeight([]),
  );
}
