import { useMemo, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { DAYS } from '../data/days';
import { PEOPLE_BY_ID, PLAYERS } from '../data/players';
import { totalsByPlayer, useEvents } from '../lib/store';
import type { DayId } from '../types';

type Tab = 'total' | DayId;

export function TabellScreen() {
  const events = useEvents();
  const [tab, setTab] = useState<Tab>('total');

  const totals = useMemo(() => {
    const tot = totalsByPlayer(events);
    return PLAYERS.map((p) => ({
      p,
      total: tot[p.id].total,
      perDay: tot[p.id].perDay,
    })).sort((a, b) =>
      tab === 'total'
        ? b.total - a.total
        : (b.perDay[tab as DayId] || 0) - (a.perDay[tab as DayId] || 0),
    );
  }, [events, tab]);

  const podium = useMemo(() => totals.slice(0, 3), [totals]);

  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>LIVE · OPPDATERES HVER MORGEN</Eyebrow>
        <H1>Tabellen</H1>

        <div className="seg" style={{ marginTop: 16 }}>
          {(
            [
              ['total', 'Totalt'],
              ['fre', 'Fre'],
              ['lor', 'Lør'],
              ['son', 'Søn'],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              className={'seg-btn' + (tab === k ? ' active' : '')}
              onClick={() => setTab(k)}
            >
              {lbl}
            </button>
          ))}
        </div>

        {podium.length >= 3 && (
          <div className="podium-row">
            {[1, 0, 2].map((idx) => {
              const row = podium[idx];
              if (!row) return <div key={idx} />;
              const place = idx + 1;
              const sz = idx === 0 ? 80 : 64;
              const ht = idx === 0 ? 92 : idx === 1 ? 64 : 44;
              const score =
                tab === 'total' ? row.total : row.perDay[tab as DayId];
              return (
                <div
                  key={row.p.id}
                  className="podium-cell"
                  style={{ alignSelf: 'flex-end' }}
                >
                  <Avatar id={row.p.id} size={sz} ring={idx === 0} />
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 600,
                      fontSize: 14,
                      marginTop: 6,
                    }}
                  >
                    {row.p.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      color: pointsColor(score),
                    }}
                  >
                    {fmtPts(score)}
                  </div>
                  <div
                    className="podium-block"
                    style={{
                      height: ht,
                      background:
                        idx === 0 ? 'var(--accent-gold)' : 'var(--card)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--display)',
                        fontStyle: 'italic',
                        fontSize: 24,
                        color: idx === 0 ? '#fff' : 'var(--ink)',
                      }}
                    >
                      {place}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="table">
          <div className={'table-head' + (tab !== 'total' ? ' single' : '')}>
            <span>#</span>
            <span>SPILLER</span>
            {tab === 'total' ? (
              DAYS.map((d) => (
                <span key={d.id} style={{ textAlign: 'center' }}>
                  {d.label.toUpperCase()}
                </span>
              ))
            ) : (
              <span style={{ textAlign: 'center' }}>POENG</span>
            )}
            <span style={{ textAlign: 'right' }}>SUM</span>
          </div>
          {totals.map((row, i) => {
            const dayShown = tab !== 'total' ? row.perDay[tab as DayId] : null;
            return (
              <div
                key={row.p.id}
                className={'table-row' + (tab !== 'total' ? ' single' : '')}
              >
                <span className="rank">{i + 1}</span>
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <Avatar id={row.p.id} size={32} />
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {row.p.name}
                  </span>
                </span>
                {tab === 'total' ? (
                  DAYS.map((d) => (
                    <span
                      key={d.id}
                      className="num"
                      style={{ color: pointsColor(row.perDay[d.id]) }}
                    >
                      {row.perDay[d.id] === 0 ? '·' : fmtPts(row.perDay[d.id])}
                    </span>
                  ))
                ) : (
                  <span
                    className="num"
                    style={{ color: pointsColor(dayShown ?? 0) }}
                  >
                    {dayShown === 0 ? '·' : fmtPts(dayShown ?? 0)}
                  </span>
                )}
                <span
                  className="num bold"
                  style={{
                    color: pointsColor(
                      tab === 'total' ? row.total : dayShown ?? 0,
                    ),
                  }}
                >
                  {fmtPts(tab === 'total' ? row.total : dayShown ?? 0)}
                </span>
              </div>
            );
          })}
        </div>

        <FeedSection />
      </div>
    </div>
  );
}

function FeedSection() {
  const events = useEvents();
  const recent = events.slice(0, 14);
  return (
    <div style={{ marginTop: 28 }}>
      <Eyebrow style={{ marginBottom: 12 }}>SISTE HENDELSER</Eyebrow>
      {recent.length === 0 && (
        <div
          style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--muted)',
            textAlign: 'center',
            padding: 18,
          }}
        >
          Ingen hendelser registrert enda.
        </div>
      )}
      <div className="feed">
        {recent.map((f) => {
          const big = f.pts >= 25;
          const actor = PEOPLE_BY_ID[f.playerId];
          return (
            <div key={f.id} className={'feed-item' + (big ? ' big' : '')}>
              <div className="feed-time">{relTime(f.ts)}</div>
              <Avatar id={f.playerId} size={36} />
              <div className="feed-body">
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {actor?.name ?? f.playerId}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--body)',
                    fontSize: 13,
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {f.ruleLabel}
                </div>
              </div>
              <div
                className="feed-pts"
                style={{ color: pointsColor(f.pts) }}
              >
                {fmtPts(f.pts)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'nå';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}t`;
  const d = Math.round(h / 24);
  return `${d}d`;
}
