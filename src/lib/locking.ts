import { DAYS_BY_ID } from '../data/days';
import type { DayId } from '../types';

const LOCK_OVERRIDE_KEY = 'fsu:lockOverride';

const DEADLINES_2026: Record<DayId, Date> = {
  fre: new Date('2026-07-17T12:00:00+02:00'),
  lor: new Date('2026-07-18T09:00:00+02:00'),
  son: new Date('2026-07-19T09:00:00+02:00'),
};

export function isDayLocked(dayId: DayId, now: Date = new Date()): boolean {
  const override = readOverride();
  if (override && override[dayId] !== undefined) return override[dayId]!;
  return now >= DEADLINES_2026[dayId];
}

export function deadlineLabel(dayId: DayId): string {
  return DAYS_BY_ID[dayId].deadline;
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
