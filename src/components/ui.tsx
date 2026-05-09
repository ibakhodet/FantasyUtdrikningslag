import type { CSSProperties, ReactNode } from 'react';
import { DAYS } from '../data/days';
import type { DayId } from '../types';

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="eyebrow" style={style}>
      {children}
    </div>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h1 className="h1" style={style}>
      {children}
    </h1>
  );
}

export function pointsColor(p: number) {
  return p > 0 ? 'var(--ok)' : p < 0 ? 'var(--bad)' : 'var(--muted)';
}

export function fmtPts(p: number) {
  return (p > 0 ? '+' : '') + p;
}

export function DayTabs({
  activeDay,
  setActiveDay,
}: {
  activeDay: DayId;
  setActiveDay: (id: DayId) => void;
}) {
  return (
    <div className="day-tabs">
      {DAYS.map((d) => {
        const active = d.id === activeDay;
        return (
          <button
            key={d.id}
            className={'day-tab' + (active ? ' active' : '')}
            onClick={() => setActiveDay(d.id)}
          >
            <span>{d.label}</span>
            <span
              className="dot"
              style={{ background: active ? 'var(--ok)' : 'var(--muted-soft)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
