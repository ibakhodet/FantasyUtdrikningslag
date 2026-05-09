import type { Person } from '../types';

export const STIAN: Person = {
  id: 'stian',
  name: 'Stian',
  nick: 'Brudgommen',
  role: 'hovedperson',
  color: '#c0392b',
  photo: '/avatars/stian.png',
  bio: 'Som snart skal gifte seg.',
};

export const PLAYERS: Person[] = [
  { id: 'eirik',  name: 'Eirik',  nick: 'Forloveren',  color: '#5b6e4a', photo: '/avatars/eirik.png',  bio: 'Forlover på papiret. Ansvarlig på papiret.' },
  { id: 'erik',   name: 'Erik',   nick: 'Skallen',     color: '#7a5640', photo: '/avatars/erik.png',   bio: 'Snakker høyest, drikker fortest.' },
  { id: 'erlend', name: 'Erlend', nick: 'Bondeknylen', color: '#3f5d6e', photo: '/avatars/erlend.png', bio: 'Reiser aldri uten Mack.' },
  { id: 'martin', name: 'Martin', nick: 'Bymannen',    color: '#856e2f', photo: '/avatars/martin.png', bio: 'Bor i Oslo. Skal vise oss byen.' },
  { id: 'sondre', name: 'Sondre', nick: 'Pølsa',       color: '#4a5a3f', photo: '/avatars/sondre.png', bio: 'Sover aldri. Henger alltid med.' },
  { id: 'thom',   name: 'Thom',   nick: 'Sjarmøren',   color: '#9b4a55', photo: '/avatars/thom.png',   bio: 'Får alltid napp. Aldri på de riktige.' },
];

export const ALL_PEOPLE: Person[] = [STIAN, ...PLAYERS];
export const PEOPLE_BY_ID: Record<string, Person> = Object.fromEntries(
  ALL_PEOPLE.map((p) => [p.id, p]),
);

export const ADMIN_PLAYER_ID = 'martin';
