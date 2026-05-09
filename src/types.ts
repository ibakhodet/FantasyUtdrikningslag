export type DayId = 'fre' | 'lor' | 'son';

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
  | 'gruppe'
  | 'stian'
  | 'pluss'
  | 'sosial'
  | 'mod'
  | 'oslo'
  | 'natt'
  | 'minus';

export interface Rule {
  id: string;
  label: string;
  pts: number;
  cat: RuleCategory;
  repeat?: boolean;
  highlight?: boolean;
  group?: boolean;
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
  groupBatchId?: string;
}

export interface Team {
  players: string[];
  captain: string | null;
}

export type Teams = Record<DayId, Team>;
