import type { Day } from '../types';

export const DAYS: Day[] = [
  { id: 'fre', label: 'Fre', long: 'Fredag',  date: '17. juli', deadline: '12:00', theme: 'Ankomst Oslo' },
  { id: 'lor', label: 'Lør', long: 'Lørdag',  date: '18. juli', deadline: '09:00', theme: 'Hoveddagen' },
  { id: 'son', label: 'Søn', long: 'Søndag',  date: '19. juli', deadline: '09:00', theme: 'Restene' },
];

export const DAYS_BY_ID: Record<string, Day> = Object.fromEntries(DAYS.map((d) => [d.id, d]));
