export type DayId = 'lor';

export interface Person {
  id: string;
  name: string;
  nick: string;
  color: string;
  photo: string;
  bio: string;
  role?: 'hovedperson';
}

export interface Day {
  id: DayId;
  label: string;
  long: string;
  date: string;
  deadline: string;
  theme: string;
}

export type RuleCategory =
  | 'stian'
  | 'drikking'
  | 'mot'
  | 'oslo'
  | 'diverse'
  | 'egen';

export interface Rule {
  id: string;
  label: string;
  pts: number;
  cat: RuleCategory;
  highlight?: boolean;
  custom?: boolean;
}

export interface CustomRule extends Rule {
  custom: true;
  createdBy: string;
  createdAt: number;
}

export interface ProgramItem {
  day: DayId;
  time: string;
  title: string;
  desc: string;
  emoji: string;
}

export interface ScoreEvent {
  id: string;
  playerId: string;
  dayId: DayId;
  ruleId: string;
  ruleLabel: string;
  pts: number;
  registeredBy: string;
  ts: number;
}

export interface Team {
  players: string[];
  captain: string | null;
}

export type Teams = Record<DayId, Team>;
