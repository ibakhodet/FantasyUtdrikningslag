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

export const DAYS: Day[] = [SATURDAY];
export const DAYS_BY_ID: Record<string, Day> = { lor: SATURDAY };
