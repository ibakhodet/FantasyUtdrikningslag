import type { Person } from '../types';

export const PLAYERS: Person[] = [
  { id: 'stian',  name: 'Stian',  nick: 'Brudgommen',  role: 'hovedperson', color: '#c0392b', photo: 'avatars/stian.png',  bio: '' },
  { id: 'eirik',  name: 'Eirik',  nick: 'Forloveren',  color: '#5b6e4a', photo: 'avatars/eirik.png',  bio: '' },
  { id: 'erik',   name: 'Erik',   nick: 'Skallen',     color: '#7a5640', photo: 'avatars/erik.png',   bio: '' },
  { id: 'erlend', name: 'Erlend', nick: 'Bondeknylen', color: '#3f5d6e', photo: 'avatars/erlend.png', bio: '' },
  { id: 'martin', name: 'Martin', nick: 'Bymannen',    color: '#856e2f', photo: 'avatars/martin.png', bio: '' },
  { id: 'sondre', name: 'Sondre', nick: 'Pølsa',       color: '#4a5a3f', photo: 'avatars/sondre.png', bio: '' },
  { id: 'thom',   name: 'Thom',   nick: 'Sjarmøren',   color: '#9b4a55', photo: 'avatars/thom.png',   bio: '' },
];

export const STIAN = PLAYERS[0];
export const ALL_PEOPLE = PLAYERS;
export const PEOPLE_BY_ID: Record<string, Person> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p]),
);

export const ADMIN_PLAYER_ID = 'martin';

// Map Google email → player id. Fyll inn når du har de 7 emailene.
// Email lookup er case-insensitive.
export const EMAIL_TO_PLAYER: Record<string, string> = {
  'stian.schul@gmail.com':       'stian',
  'marteri9@gmail.com':          'martin',
  'eriktrei@gmail.com':          'erik',
  'eirpedersen@gmail.com':       'eirik',
  'erlendrobertsen@icloud.com':  'erlend',
  'tunlisondre@gmail.com':       'sondre',
  'thom.r.pedersen@gmail.com':   'thom',
};

export function lookupPlayerByEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return EMAIL_TO_PLAYER[email.toLowerCase()] ?? null;
}
