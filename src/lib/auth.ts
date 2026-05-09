import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
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
  magicLinkError: string | null;
}

const provider = new GoogleAuthProvider();
const EMAIL_FOR_LINK_KEY = 'fsu:emailForLink';

export function useFirebaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: false,
    user: null,
    playerId: null,
    unknownEmail: null,
    magicLinkError: null,
  });

  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      setState({ loading: false, user: null, playerId: null, unknownEmail: null, magicLinkError: null });
      return;
    }

    // Complete magic-link sign-in if we landed here via the email link.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
      if (!email) {
        email = window.prompt('Bekreft email-en du ba om login-lenke til:');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
          })
          .catch((err: unknown) => {
            console.error('Magic link sign-in failed', err);
            const msg = err instanceof Error ? err.message : 'Login-lenken feilet. Prøv å be om en ny.';
            setState((s) => ({ ...s, loading: false, magicLinkError: msg }));
          });
      }
    }

    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCurrentUserId(null);
        setState({ loading: false, user: null, playerId: null, unknownEmail: null, magicLinkError: null });
        return;
      }
      const playerId = lookupPlayerByEmail(user.email);
      if (playerId) {
        setCurrentUserId(playerId);
        setState({ loading: false, user, playerId, unknownEmail: null, magicLinkError: null });
      } else {
        setCurrentUserId(null);
        setState({ loading: false, user, playerId: null, unknownEmail: user.email, magicLinkError: null });
      }
    });
  }, []);

  return state;
}

export async function loginWithGoogle() {
  if (!auth) return;
  await signInWithPopup(auth, provider);
}

export async function sendMagicLink(email: string) {
  if (!auth) return;
  const url = window.location.origin + window.location.pathname;
  await sendSignInLinkToEmail(auth, email, {
    url,
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_FOR_LINK_KEY, email);
}

export async function logout() {
  if (auth) await signOut(auth);
  setCurrentUserId(null);
}
