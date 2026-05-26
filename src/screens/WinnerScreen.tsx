import { useMemo } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow, fmtPts, pointsColor } from '../components/ui';
import { PEOPLE_BY_ID, PLAYERS, ADMIN_PLAYER_ID } from '../data/players';
import { fantasyTotalByUser, totalsByPlayer, useAllTeams, useEvents } from '../lib/store';
import { setResultsOverride } from '../lib/locking';

interface Props {
  userId: string;
}

function rankOf(sorted: { fantasyTotal: number }[], i: number): number {
  const score = sorted[i].fantasyTotal;
  return sorted.findIndex((r) => r.fantasyTotal === score) + 1;
}

export function WinnerScreen({ userId }: Props) {
  const events = useEvents();
  const allTeams = useAllTeams();
  const rawTotals = useMemo(() => totalsByPlayer(events), [events]);

  const standings = useMemo(
    () =>
      PLAYERS.map((p) => ({
        p,
        fantasyTotal: fantasyTotalByUser(p.id, allTeams, rawTotals),
        team: allTeams[p.id]?.['lor'] ?? null,
      })).sort((a, b) => b.fantasyTotal - a.fantasyTotal),
    [allTeams, rawTotals],
  );

  const hasScores = standings.some((r) => r.fantasyTotal !== 0);
  const topScore = standings[0]?.fantasyTotal ?? 0;
  const winners = hasScores ? standings.filter((r) => r.fantasyTotal === topScore) : [];
  const isAdmin = userId === ADMIN_PLAYER_ID;

  return (
    <div className="screen scroll">
      <div className="screen-pad" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <Eyebrow>FINALE · SØNDAG</Eyebrow>
          <div style={{ fontSize: 72, lineHeight: 1, marginTop: 8 }}>🏆</div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              color: 'var(--muted)',
              marginTop: 14,
            }}
          >
            {winners.length > 1 ? 'Vinnerne er' : 'Vinneren er'}
          </div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: winners.length > 1 ? 34 : 46,
              lineHeight: 1.05,
              marginTop: 4,
            }}
          >
            {winners.length > 0 ? winners.map((w) => w.p.name).join(' & ') : '—'}
          </div>

          {winners.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 14,
                marginTop: 18,
              }}
            >
              {winners.map((w) => (
                <Avatar key={w.p.id} id={w.p.id} size={92} ring />
              ))}
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 26,
              color: 'var(--accent-gold)',
              fontWeight: 600,
              marginTop: 18,
            }}
          >
            {fmtPts(hasScores ? topScore : 0)}
          </div>
          <div
            style={{
              fontFamily: 'var(--body)',
              fontSize: 13.5,
              color: 'var(--muted)',
              marginTop: 4,
            }}
          >
            {winners.length > 1
              ? 'Delt førsteplass 🎉'
              : winners.length === 1
                ? 'Fantasy-mester 🎉'
                : 'Ingen poeng registrert.'}
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <Eyebrow style={{ marginBottom: 12 }}>SLUTTRESULTAT</Eyebrow>
          {standings.map((row, i) => {
            const team = row.team;
            const rank = rankOf(standings, i);
            const isWinner = rank === 1 && hasScores;
            return (
              <div
                key={row.p.id}
                className="card"
                style={{
                  marginBottom: 10,
                  padding: '14px 16px',
                  ...(isWinner
                    ? { background: 'linear-gradient(120deg, var(--accent-soft) 0%, var(--card) 70%)' }
                    : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontStyle: 'italic',
                      fontSize: 20,
                      color: isWinner ? 'var(--accent-gold)' : 'var(--muted)',
                      width: 22,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {rank}
                  </span>
                  <Avatar id={row.p.id} size={40} ring={isWinner} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--display)',
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 6,
                      }}
                    >
                      {row.p.name}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {team && team.players.length > 0 ? (
                        team.players.map((pid) => {
                          const isCapt = team.captain === pid;
                          const pPts = rawTotals[pid]?.perDay['lor'] ?? 0;
                          const person = PEOPLE_BY_ID[pid];
                          return (
                            <div
                              key={pid}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                background: 'var(--bg)',
                                borderRadius: 7,
                                padding: '3px 7px',
                                border: isCapt
                                  ? '1.5px solid var(--accent-gold)'
                                  : '1.5px solid transparent',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'var(--display)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {person?.name ?? pid}
                              </span>
                              {isCapt && (
                                <span
                                  className="badge-mono"
                                  style={{ color: 'var(--accent-gold)', marginLeft: 1 }}
                                >
                                  K
                                </span>
                              )}
                              <span
                                style={{
                                  fontFamily: 'var(--mono)',
                                  fontSize: 11,
                                  color: pointsColor(pPts),
                                }}
                              >
                                {isCapt ? `${fmtPts(pPts)}×2` : fmtPts(pPts)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span
                          style={{
                            fontFamily: 'var(--body)',
                            fontSize: 12,
                            color: 'var(--muted)',
                          }}
                        >
                          Ingen lag satt
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="num bold"
                    style={{
                      color: isWinner ? 'var(--accent-gold)' : pointsColor(row.fantasyTotal),
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {fmtPts(row.fantasyTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <button
              className="ghost-btn"
              style={{ width: '100%' }}
              onClick={() => setResultsOverride(false)}
            >
              ⚙ Endre poeng (admin)
            </button>
            <p
              style={{
                fontFamily: 'var(--body)',
                fontSize: 12,
                color: 'var(--muted)',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Tar deg tilbake til appen. Re-aktiver vinner-skjermen fra Frist-fanen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
