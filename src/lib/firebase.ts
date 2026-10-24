import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { collection, doc, getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
})

export const auth = getAuth(app)
export const db = getFirestore(app)

export function currentUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Not signed in')
  return uid
}

// All ReelTrip data lives under apps/reeltrip; per-user data under users/{uid}.
export const userCollection = (name: 'trips' | 'pois') =>
  collection(db, 'apps', 'reeltrip', 'users', currentUid(), name)

export const apiTokensCollection = () => collection(db, 'apps', 'reeltrip', 'api_tokens')

export const userDoc = (name: 'trips' | 'pois', id: string) =>
  doc(db, 'apps', 'reeltrip', 'users', currentUid(), name, id)
