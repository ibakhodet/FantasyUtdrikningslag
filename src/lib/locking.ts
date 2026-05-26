import type { DayId } from '../types';
import { SATURDAY_DEADLINE_TS, SUNDAY_RESULTS_TS } from '../data/days';

const LOCK_OVERRIDE_KEY = 'fsu:lockOverride';
const RESULTS_OVERRIDE_KEY = 'fsu:resultsOverride';

export function isDayLocked(dayId: DayId): boolean {
  const override = readOverride();
  if (override && override[dayId] !== undefined) return override[dayId]!;
  return Date.now() >= SATURDAY_DEADLINE_TS;
}

function readOverride(): Partial<Record<DayId, boolean>> | null {
  try {
    const raw = localStorage.getItem(LOCK_OVERRIDE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLockOverride(dayId: DayId, locked: boolean | undefined) {
  const cur = readOverride() ?? {};
  if (locked === undefined) delete cur[dayId];
  else cur[dayId] = locked;
  localStorage.setItem(LOCK_OVERRIDE_KEY, JSON.stringify(cur));
}

export function getLockOverrides(): Partial<Record<DayId, boolean>> {
  return readOverride() ?? {};
}

export function isResultsRevealed(): boolean {
  try {
    const raw = localStorage.getItem(RESULTS_OVERRIDE_KEY);
    if (raw !== null) return JSON.parse(raw) as boolean;
  } catch {
    // fall through to time-based check
  }
  return Date.now() >= SUNDAY_RESULTS_TS;
}

export const RESULTS_CHANGE_EVENT = 'fsu:results-change';

export function setResultsOverride(value: boolean | undefined) {
  if (value === undefined) localStorage.removeItem(RESULTS_OVERRIDE_KEY);
  else localStorage.setItem(RESULTS_OVERRIDE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(RESULTS_CHANGE_EVENT));
}

export function getResultsOverride(): boolean | undefined {
  try {
    const raw = localStorage.getItem(RESULTS_OVERRIDE_KEY);
    if (raw !== null) return JSON.parse(raw) as boolean;
  } catch {
    // ignore
  }
  return undefined;
}
