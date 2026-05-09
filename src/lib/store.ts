import { useSyncExternalStore } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_ENABLED, db } from './firebase';
import { PLAYERS } from '../data/players';
import type { CustomRule, DayId, ScoreEvent, Team, Teams } from '../types';

const EVENTS_KEY = 'fsu:events';
const TEAMS_KEY = 'fsu:teams';
const CUSTOM_RULES_KEY = 'fsu:customRules';
const USER_KEY = 'fsu:userId';

function emptyTeams(): Teams {
  return {
    lor: { players: [], captain: null },
  };
}

// Stable reference for empty state — useSyncExternalStore requires snapshots
// to be reference-stable, otherwise React throws and blanks the app.
const EMPTY_TEAMS: Teams = Object.freeze({
  lor: Object.freeze({ players: [] as string[], captain: null }) as Team,
}) as Teams;

// ---- localStorage backed store with subscription ----

type Listener = () => void;

class LocalStore {
  private events: ScoreEvent[] = [];
  private teams: Record<string, Teams> = {}; // userId -> Teams
  private customRules: CustomRule[] = [];
  private listeners = new Set<Listener>();

  constructor() {
    try {
      const ev = localStorage.getItem(EVENTS_KEY);
      if (ev) this.events = JSON.parse(ev);
      const tm = localStorage.getItem(TEAMS_KEY);
      if (tm) this.teams = JSON.parse(tm);
      const cr = localStorage.getItem(CUSTOM_RULES_KEY);
      if (cr) this.customRules = JSON.parse(cr);
    } catch {
      /* empty */
    }
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  private emit() {
    this.listeners.forEach((l) => l());
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(this.events));
      localStorage.setItem(TEAMS_KEY, JSON.stringify(this.teams));
      localStorage.setItem(CUSTOM_RULES_KEY, JSON.stringify(this.customRules));
    } catch {
      /* empty */
    }
  }

  getEvents = () => this.events;
  getTeams = (userId: string): Teams => this.teams[userId] ?? EMPTY_TEAMS;
  getCustomRules = () => this.customRules;

  addEvent(ev: Omit<ScoreEvent, 'id' | 'ts'>) {
    const full: ScoreEvent = {
      ...ev,
      id: crypto.randomUUID(),
      ts: Date.now(),
    };
    this.events = [full, ...this.events];
    this.emit();
  }

  addGroupEvents(common: Omit<ScoreEvent, 'id' | 'ts' | 'playerId' | 'groupBatchId'>) {
    const batchId = crypto.randomUUID();
    const ts = Date.now();
    const newEvents: ScoreEvent[] = PLAYERS.map((p) => ({
      ...common,
      playerId: p.id,
      id: crypto.randomUUID(),
      ts,
      groupBatchId: batchId,
    }));
    // Stian (hovedperson) får også gruppe-poeng — han er en av spillerne nå.
    this.events = [...newEvents, ...this.events];
    this.emit();
  }

  removeEvent(id: string) {
    this.events = this.events.filter((e) => e.id !== id);
    this.emit();
  }

  setTeam(userId: string, dayId: DayId, team: Team) {
    const cur = this.teams[userId] ?? emptyTeams();
    this.teams[userId] = { ...cur, [dayId]: team };
    this.emit();
  }

  addCustomRule(rule: Omit<CustomRule, 'id' | 'createdAt' | 'custom'>) {
    const full: CustomRule = {
      ...rule,
      id: 'custom-' + crypto.randomUUID(),
      custom: true,
      createdAt: Date.now(),
    };
    this.customRules = [...this.customRules, full];
    this.emit();
  }

  removeCustomRule(id: string) {
    this.customRules = this.customRules.filter((r) => r.id !== id);
    this.emit();
  }
}

export const localStore = new LocalStore();

// ---- Firestore-backed store (subscribes via onSnapshot) ----

class FirestoreStore {
  private events: ScoreEvent[] = [];
  private teams: Record<string, Teams> = {};
  private customRules: CustomRule[] = [];
  private listeners = new Set<Listener>();
  private inited = false;

  init() {
    if (this.inited || !db) return;
    this.inited = true;
    onSnapshot(collection(db, 'events'), (snap) => {
      this.events = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ScoreEvent, 'id'>) }))
        .sort((a, b) => b.ts - a.ts);
      this.emit();
    });
    onSnapshot(collection(db, 'teams'), (snap) => {
      const next: Record<string, Teams> = {};
      snap.docs.forEach((d) => {
        const [userId, dayId] = d.id.split('_') as [string, DayId];
        if (!next[userId]) next[userId] = emptyTeams();
        next[userId][dayId] = d.data() as Team;
      });
      this.teams = next;
      this.emit();
    });
    onSnapshot(collection(db, 'customRules'), (snap) => {
      this.customRules = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CustomRule, 'id'>) }))
        .sort((a, b) => a.createdAt - b.createdAt);
      this.emit();
    });
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    this.init();
    return () => {
      this.listeners.delete(l);
    };
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  getEvents = () => this.events;
  getTeams = (userId: string): Teams => this.teams[userId] ?? EMPTY_TEAMS;
  getCustomRules = () => this.customRules;

  async addEvent(ev: Omit<ScoreEvent, 'id' | 'ts'>) {
    if (!db) return;
    await addDoc(collection(db, 'events'), { ...ev, ts: Date.now(), serverTs: serverTimestamp() });
  }

  async addGroupEvents(common: Omit<ScoreEvent, 'id' | 'ts' | 'playerId' | 'groupBatchId'>) {
    if (!db) return;
    const batchId = crypto.randomUUID();
    const ts = Date.now();
    await Promise.all(
      PLAYERS.map((p) =>
        addDoc(collection(db!, 'events'), {
          ...common,
          playerId: p.id,
          ts,
          groupBatchId: batchId,
          serverTs: serverTimestamp(),
        }),
      ),
    );
  }

  async removeEvent(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'events', id));
  }

  async setTeam(userId: string, dayId: DayId, team: Team) {
    if (!db) return;
    await setDoc(doc(db, 'teams', `${userId}_${dayId}`), team);
  }

  async addCustomRule(rule: Omit<CustomRule, 'id' | 'createdAt' | 'custom'>) {
    if (!db) return;
    await addDoc(collection(db, 'customRules'), {
      ...rule,
      custom: true,
      createdAt: Date.now(),
    });
  }

  async removeCustomRule(id: string) {
    if (!db) return;
    await deleteDoc(doc(db, 'customRules', id));
  }
}

const firestoreStore = new FirestoreStore();
const store = FIREBASE_ENABLED ? firestoreStore : localStore;

export function useEvents(): ScoreEvent[] {
  return useSyncExternalStore(store.subscribe, store.getEvents, store.getEvents);
}

export function useTeams(userId: string | null): Teams {
  const teams = useSyncExternalStore(
    store.subscribe,
    () => (userId ? store.getTeams(userId) : EMPTY_TEAMS),
    () => EMPTY_TEAMS,
  );
  return teams;
}

export function addEvent(ev: Omit<ScoreEvent, 'id' | 'ts'>) {
  return store.addEvent(ev);
}

export function addGroupEvents(
  common: Omit<ScoreEvent, 'id' | 'ts' | 'playerId' | 'groupBatchId'>,
) {
  return store.addGroupEvents(common);
}

export function removeEvent(id: string) {
  return store.removeEvent(id);
}

export function setTeam(userId: string, dayId: DayId, team: Team) {
  return store.setTeam(userId, dayId, team);
}

export function useCustomRules(): CustomRule[] {
  return useSyncExternalStore(
    store.subscribe,
    store.getCustomRules,
    store.getCustomRules,
  );
}

export function addCustomRule(
  rule: Omit<CustomRule, 'id' | 'createdAt' | 'custom'>,
) {
  return store.addCustomRule(rule);
}

export function removeCustomRule(id: string) {
  return store.removeCustomRule(id);
}

// ---- Current user (player identity) ----

type UserListener = (id: string | null) => void;
const userListeners = new Set<UserListener>();
let currentUserId: string | null =
  typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

function emitUser() {
  userListeners.forEach((l) => l(currentUserId));
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function setCurrentUserId(id: string | null) {
  currentUserId = id;
  if (id) localStorage.setItem(USER_KEY, id);
  else localStorage.removeItem(USER_KEY);
  emitUser();
}

export function useCurrentUserId(): string | null {
  const subscribe = (l: () => void) => {
    const wrapped: UserListener = () => l();
    userListeners.add(wrapped);
    return () => {
      userListeners.delete(wrapped);
    };
  };
  return useSyncExternalStore(subscribe, getCurrentUserId, getCurrentUserId);
}

// ---- Seed demo data on first run (only when Firebase not configured) ----

export function seedDemoIfEmpty() {
  if (FIREBASE_ENABLED) return;
  const events = localStore.getEvents();
  if (events.length > 0) return;

  // initial scores roughly matching the design mock
  const seed: Array<Omit<ScoreEvent, 'id' | 'ts'>> = [
    { playerId: 'eirik',  dayId: 'lor', ruleId: 'pluss-ansvar',   ruleLabel: 'Tar ansvar for gruppa',          pts: 10, registeredBy: 'martin' },
    { playerId: 'eirik',  dayId: 'lor', ruleId: 'stian-baere',    ruleLabel: 'Bærer Stian fra A til B',         pts: 25, registeredBy: 'martin' },
    { playerId: 'erik',   dayId: 'lor', ruleId: 'mod-kastes-ut',  ruleLabel: 'Kastes ut av utested',           pts: 25, registeredBy: 'martin' },
    { playerId: 'erlend', dayId: 'lor', ruleId: 'oslo-dukkert',   ruleLabel: 'Tar en dukkert i Oslofjorden',   pts: 30, registeredBy: 'martin' },
    { playerId: 'erlend', dayId: 'lor', ruleId: 'mod-drikker',    ruleLabel: 'Drikker noe ukjent valgt av andre', pts: 20, registeredBy: 'martin' },
    { playerId: 'martin', dayId: 'lor', ruleId: 'sosial-allsang', ruleLabel: 'Byr opp til allsang',            pts: 25, registeredBy: 'martin' },
    { playerId: 'martin', dayId: 'lor', ruleId: 'sosial-pils',    ruleLabel: 'Spanderer en pils til en',       pts: 10, registeredBy: 'martin' },
    { playerId: 'sondre', dayId: 'lor', ruleId: 'minus-klager',   ruleLabel: 'Klager',                         pts: -5, registeredBy: 'martin' },
    { playerId: 'thom',   dayId: 'lor', ruleId: 'sosial-alldans', ruleLabel: 'Byr opp til alldans',            pts: 25, registeredBy: 'martin' },
    { playerId: 'thom',   dayId: 'lor', ruleId: 'mod-bestiller',  ruleLabel: 'Bestiller noe ingen andre tør', pts: 15, registeredBy: 'martin' },
  ];

  for (const ev of seed) localStore.addEvent(ev);
}

// ---- Helpers ----

export function eventsForPlayerDay(events: ScoreEvent[], playerId: string, dayId: DayId) {
  return events.filter((e) => e.playerId === playerId && e.dayId === dayId);
}

export function totalsByPlayer(events: ScoreEvent[]) {
  const out: Record<string, { total: number; perDay: Record<DayId, number> }> = {};
  for (const p of PLAYERS) {
    out[p.id] = { total: 0, perDay: { lor: 0 } };
  }
  for (const e of events) {
    if (!out[e.playerId]) continue;
    out[e.playerId].perDay[e.dayId] += e.pts;
    out[e.playerId].total += e.pts;
  }
  return out;
}
