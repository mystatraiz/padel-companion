'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase client config — intentionally public (security via Firestore Rules)
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'AIzaSyBETTEd2pZw1TQxuB2JhPTxBJzF4vgA5fU',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'padel-pulse-b6da5.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'padel-pulse-b6da5',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'padel-pulse-b6da5.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '508524428877',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '1:508524428877:web:8129d6b54673eaf47c6604',
};

// ─── Lazy singletons — never called at module-eval time (safe for SSR/static export) ─

let _app:  FirebaseApp | null = null;
let _db:   Firestore   | null = null;
let _auth: Auth        | null = null;

function app(): FirebaseApp {
  return (_app ??= getApps()[0] ?? initializeApp(firebaseConfig));
}

export function getDB():           Firestore { return (_db   ??= getFirestore(app())); }
export function getFirebaseAuth(): Auth      { return (_auth ??= getAuth(app()));      }
