import { Avatar } from '../components/Avatar';
import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { ALL_PEOPLE, PEOPLE_BY_ID, WITHDRAWN_IDS } from '../data/players';
import { SATURDAY, SATURDAY_ID } from '../data/days';
import { isDayLocked } from '../lib/locking';
import { fillTeamSeats, setTeam, useEvents, useTeams } from '../lib/store';

interface Props {
  userId: string;
}

export function TeamScreen({ userId }: Props) {
  const day = SATURDAY;
  const teams = useTeams(userId);
  const events = useEvents();

  const inTeam = teams[SATURDAY_ID];
  const candidates = ALL_PEOPLE.filter((p) => p.id !== userId); // can pick Stian, not self
  const isLocked = isDayLocked(SATURDAY_ID);
  // Filter out withdrawn players (e.g. Erik) from stored picks before display/logic.
  const activePicks = inTeam.players.filter((pid) => !WITHDRAWN_IDS.has(pid));
  const effectiveCaptain = WITHDRAWN_IDS.has(inTeam.captain ?? '') ? null : inTeam.captain;
  const seats = isLocked ? fillTeamSeats(userId, inTeam.players) : activePicks;

  function togglePlayer(pid: string) {
    if (isLocked) return;
    if (activePicks.includes(pid)) {
      setTeam(userId, SATURDAY_ID, {
        players: activePicks.filter((x) => x !== pid),
        captain: effectiveCaptain === pid ? null : effectiveCaptain,
      });
    } else if (activePicks.length < 4) {
      setTeam(userId, SATURDAY_ID, { players: [...activePicks, pid], captain: effectiveCaptain });
    }
  }
  function setCap(pid: string) {
    if (isLocked) return;
    if (!activePicks.includes(pid)) return;
    setTeam(userId, SATURDAY_ID, {
      players: activePicks,
      captain: effectiveCaptain === pid ? null : pid,
    });
  }

  function dayPts(pid: string) {
    return events
      .filter((e) => e.playerId === pid && e.dayId === SATURDAY_ID)
      .reduce((s, e) => s + e.pts, 0);
  }

  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>SETT OPP LAG · {day.long.toUpperCase()}</Eyebrow>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 4,
            gap: 12,
          }}
        >
          <H1>{day.theme}</H1>
          <div style={{ textAlign: 'right' }}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              {isLocked ? 'LÅST' : 'FRIST'}
            </div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {isLocked ? 'Låst' : day.deadline}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20, padding: '18px 16px 14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Eyebrow>{day.theme.toUpperCase()}</Eyebrow>
            <Eyebrow>{activePicks.length}/4</Eyebrow>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const pid = seats[i];
              if (!pid)
                return (
                  <div key={i} className="slot-empty">
                    +
                  </div>
                );
              const isCap = effectiveCaptain === pid;
              const isAuto = isLocked && !activePicks.includes(pid);
              return (
                <div
                  key={pid}
                  className="slot"
                  style={{
                    borderColor: isCap ? 'var(--accent-gold)' : 'transparent',
                    opacity: isAuto ? 0.7 : 1,
                  }}
                  onClick={() => (isLocked ? null : setCap(pid))}
                >
                  {!isLocked && (
                    <button
                      className="slot-x"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayer(pid);
                      }}
                      aria-label="Fjern"
                    >
                      ×
                    </button>
                  )}
                  <Avatar id={pid} size={50} captain={isCap} />
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: 'var(--display)',
                      fontWeight: 600,
                      marginTop: 6,
                    }}
                  >
                    {PEOPLE_BY_ID[pid]?.name ?? pid}
                  </div>
                  {isAuto && (
                    <div
                      className="badge-mono"
                      style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}
                    >
                      auto
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {isLocked ? (
            <div className="locked-banner" role="status" aria-live="polite">
              🔒 Låst, fristen er passert
            </div>
          ) : (
            <div
              style={{
                fontSize: 12.5,
                fontFamily: 'var(--body)',
                color: 'var(--muted)',
                textAlign: 'center',
                marginTop: 14,
                padding: '0 8px',
              }}
            >
              {activePicks.length < 4
                ? 'Velg 4 fra benken under.'
                : effectiveCaptain
                ? 'Trykk på en spiller for å bytte kaptein.'
                : 'Trykk på en spiller for å sette kaptein (×2).'}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Eyebrow>BENK · TRYKK FOR Å {isLocked ? 'SE' : 'VELGE'}</Eyebrow>
          <Eyebrow style={{ color: 'var(--muted-soft)' }}>
            {candidates.length} TILGJENGELIG
          </Eyebrow>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}
        >
          {candidates.map((p) => {
            const inT = activePicks.includes(p.id);
            const dPts = dayPts(p.id);
            return (
              <div
                key={p.id}
                className={'bench-card' + (isLocked ? ' disabled' : '')}
                style={{
                  borderColor: inT ? 'var(--accent)' : 'transparent',
                  opacity: inT ? 0.45 : 1,
                  minHeight: 96,
                }}
                onClick={() => togglePlayer(p.id)}
              >
                <Avatar id={p.id} size={44} dim={inT} />
                <div
                  style={{
                    fontSize: 12.5,
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    marginTop: 5,
                    color: p.id === 'stian' ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontFamily: 'var(--mono)',
                    color: pointsColor(dPts),
                    marginTop: 1,
                  }}
                >
                  {dPts === 0 ? '·' : fmtPts(dPts) + ' pt'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
