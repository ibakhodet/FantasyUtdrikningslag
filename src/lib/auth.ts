import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { FIREBASE_ENABLED, auth } from './firebase';
import { lookupPlayerByEmail } from '../data/players';
import { setCurrentUserId } from './store';

export interface AuthState {
  loading: boolean;
  user: User | null;
  playerId: string | null;
  unknownEmail: string | null;
}

const provider = new GoogleAuthProvider();

export function useFirebaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: FIREBASE_ENABLED,
    user: null,
    playerId: null,
    unknownEmail: null,
  });

  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      setState({ loading: false, user: null, playerId: null, unknownEmail: null });
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUserId(null);
        setState({ loading: false, user: null, playerId: null, unknownEmail: null });
        return;
      }
      const playerId = lookupPlayerByEmail(user.email);
      if (playerId) {
        setCurrentUserId(playerId);
        setState({ loading: false, user, playerId, unknownEmail: null });
      } else {
        setCurrentUserId(null);
        setState({ loading: false, user, playerId: null, unknownEmail: user.email });
      }
    });
  }, []);

  return state;
}

export async function loginWithGoogle() {
  if (!auth) return;
  await signInWithPopup(auth, provider);
}

export async function logout() {
  if (auth) await signOut(auth);
  setCurrentUserId(null);
}
