'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
