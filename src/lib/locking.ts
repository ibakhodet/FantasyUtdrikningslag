import type { DayId } from '../types';
import { SATURDAY_DEADLINE_TS } from '../data/days';

const LOCK_OVERRIDE_KEY = 'fsu:lockOverride';

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
