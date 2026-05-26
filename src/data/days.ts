import type { Day, DayId } from '../types';

// Hele appen handler om bryllupsdagen - lørdag.
export const SATURDAY_ID: DayId = 'lor';

export const SATURDAY: Day = {
  id: 'lor',
  label: 'Lør',
  long: 'Lørdag',
  date: '30. mai',
  deadline: '09:00',
  theme: 'Hoveddagen',
};

// Faktisk frist: lørdag 30. mai 2026 kl 09:00, Oslo-tid (CEST = UTC+2).
export const SATURDAY_DEADLINE_TS = new Date('2026-05-30T09:00:00+02:00').getTime();

export const DAYS: Day[] = [SATURDAY];
export const DAYS_BY_ID: Record<string, Day> = { lor: SATURDAY };
