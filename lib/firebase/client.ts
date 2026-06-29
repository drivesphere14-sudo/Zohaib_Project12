// lib/firebase/client.ts
// Single Firebase init for the whole app. The web config below is NOT secret —
// it only identifies the project; your Realtime Database security rules protect data.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getDatabase, type Database } from "firebase/database"
import { getAuth, type Auth } from "firebase/auth"
import { getAnalytics, type Analytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyCOTpk7sDHx5Fhqa1-HUe8wnN_n5cVy7p8",
  authDomain: "gsptracker-57beb.firebaseapp.com",
  databaseURL: "https://gsptracker-57beb-default-rtdb.firebaseio.com",
  projectId: "gsptracker-57beb",
  storageBucket: "gsptracker-57beb.firebasestorage.app",
  messagingSenderId: "1031074796276",
  appId: "1:1031074796276:web:4f1d48521fcd3ca84ec4a1",
}

// Initialize once (guards against Next.js hot-reload re-init errors).
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Named exports used across the project.
export function getFirebaseApp(): FirebaseApp {
  return app
}

export const database: Database = getDatabase(app)
export const auth: Auth = getAuth(app)

export function isFirebaseAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(firebaseConfig.projectId)
}

export function getFirebaseDatabase(): Database | null {
  return isFirebaseAvailable() ? database : null
}

let analyticsInstance: Analytics | null = null

export function getFirebaseAnalytics(): Analytics | null {
  if (!isFirebaseAvailable()) return null

  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(app)
    } catch {
      return null
    }
  }

  return analyticsInstance
}

export default app