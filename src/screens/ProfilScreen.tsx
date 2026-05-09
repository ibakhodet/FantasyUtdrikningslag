import { useMemo } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow, fmtPts, pointsColor } from '../components/ui';
import { PEOPLE_BY_ID, PLAYERS } from '../data/players';
import { fantasyTotalByUser, totalsByPlayer, useAllTeams, useEvents } from '../lib/store';
import { logout } from '../lib/auth';

interface Props {
  userId: string;
}

export function ProfilScreen({ userId }: Props) {
  const me = PEOPLE_BY_ID[userId];
  const events = useEvents();
  const allTeams = useAllTeams();
  const rawTotals = useMemo(() => totalsByPlayer(events), [events]);
  const myTotal = rawTotals[userId]?.total ?? 0;
  const myEvents = events.filter((e) => e.playerId === userId);

  const place = useMemo(() => {
    const myScore = fantasyTotalByUser(userId, allTeams, rawTotals);
    const higher = PLAYERS.filter(
      (p) => fantasyTotalByUser(p.id, allTeams, rawTotals) > myScore,
    ).length;
    return higher + 1;
  }, [allTeams, rawTotals, userId]);

  if (!me) return null;

  return (
    <div className="screen scroll">
      <div
        className="screen-pad"
        style={{ textAlign: 'center', paddingTop: 30 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar id={me.id} size={120} />
        </div>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontWeight: 700,
            fontSize: 28,
            marginTop: 14,
          }}
        >
          {me.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--muted)',
            marginTop: 2,
          }}
        >
          {me.nick}
        </div>

        <div className="profile-stats">
          <div className="stat">
            <div
              className="stat-num"
              style={{ color: pointsColor(myTotal) }}
            >
              {fmtPts(myTotal)}
            </div>
            <Eyebrow>POENG TOTALT</Eyebrow>
          </div>
          <div className="stat">
            <div className="stat-num">{place || '–'}.</div>
            <Eyebrow>PLASSERING</Eyebrow>
          </div>
          <div className="stat">
            <div className="stat-num">{myEvents.length}</div>
            <Eyebrow>HENDELSER</Eyebrow>
          </div>
        </div>

        {me.bio ? (
          <div
            className="card"
            style={{ padding: 18, marginTop: 18, textAlign: 'left' }}
          >
            <div
              style={{
                fontFamily: 'var(--body)',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {me.bio}
            </div>
          </div>
        ) : null}

        {myEvents.length > 0 && (
          <div
            className="card"
            style={{ padding: 0, marginTop: 12, textAlign: 'left' }}
          >
            <div style={{ padding: '14px 16px 8px' }}>
              <Eyebrow>DINE HENDELSER</Eyebrow>
            </div>
            <div>
              {myEvents.slice(0, 20).map((e) => (
                <div key={e.id} className="rule-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--display)',
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.ruleLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: 'var(--muted-soft)',
                        marginTop: 2,
                      }}
                    >
                      {e.dayId.toUpperCase()}
                      {e.groupBatchId ? ' · GRUPPE' : ''}
                    </div>
                  </div>
                  <span
                    className="num bold"
                    style={{ color: pointsColor(e.pts), fontSize: 15 }}
                  >
                    {fmtPts(e.pts)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="ghost-btn"
          style={{ marginTop: 22, width: '100%' }}
          onClick={() => {
            sessionStorage.removeItem('fsu:adminUnlocked');
            void logout();
          }}
        >
          Logg ut
        </button>
      </div>
    </div>
  );
}
