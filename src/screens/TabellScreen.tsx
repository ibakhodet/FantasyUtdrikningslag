import { useMemo } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { PEOPLE_BY_ID, PLAYERS } from '../data/players';
import { fantasyTotalByUser, totalsByPlayer, useAllTeams, useEvents } from '../lib/store';

export function TabellScreen() {
  const events = useEvents();
  const allTeams = useAllTeams();

  const totals = useMemo(() => {
    const raw = totalsByPlayer(events);
    return PLAYERS.map((p) => ({
      p,
      rawPts: raw[p.id]?.perDay['lor'] ?? 0,
      total: fantasyTotalByUser(p.id, allTeams, raw),
    })).sort((a, b) => (b.total - a.total) || (b.rawPts - a.rawPts));
  }, [events, allTeams]);

  const podium = useMemo(() => totals.slice(0, 3), [totals]);

  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>LIVE</Eyebrow>
        <H1>Tabellen</H1>

        {podium.length >= 3 && (
          <div className="podium-row">
            {[1, 0, 2].map((idx) => {
              const row = podium[idx];
              if (!row) return <div key={idx} />;
              const place = idx + 1;
              const sz = idx === 0 ? 80 : 64;
              const ht = idx === 0 ? 92 : idx === 1 ? 64 : 44;
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
                      color: pointsColor(row.total || row.rawPts),
                    }}
                  >
                    {fmtPts(row.total || row.rawPts)}
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
          <div className="table-head single">
            <span>#</span>
            <span>SPILLER</span>
            <span style={{ textAlign: 'center' }}>EGNE</span>
            <span style={{ textAlign: 'right' }}>FANTASY</span>
          </div>
          {totals.map((row, i) => (
            <div key={row.p.id} className="table-row single">
              <span className="rank">{i + 1}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <span
                className="num"
                style={{ color: pointsColor(row.rawPts) }}
              >
                {row.rawPts === 0 ? '·' : fmtPts(row.rawPts)}
              </span>
              <span
                className="num bold"
                style={{ color: pointsColor(row.total) }}
              >
                {fmtPts(row.total)}
              </span>
            </div>
          ))}
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
              <div className="feed-pts" style={{ color: pointsColor(f.pts) }}>
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
