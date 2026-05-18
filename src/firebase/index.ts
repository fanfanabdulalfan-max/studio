
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inisialisasi Firebase dengan pengecekan konfigurasi yang aman.
 * Jika API Key tidak ditemukan, fungsi akan mengembalikan objek null agar aplikasi tidak crash.
 */
export function initializeFirebase(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
} {
  try {
    // Cek apakah konfigurasi minimal tersedia
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
      return { app: null, db: null, auth: null };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    return { app, db, auth };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { app: null, db: null, auth: null };
  }
}
