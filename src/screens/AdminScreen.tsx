import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { ALL_PEOPLE, PEOPLE_BY_ID, PLAYERS, ADMIN_PLAYER_ID } from '../data/players';
import { SATURDAY, SATURDAY_ID } from '../data/days';
import { RULES } from '../data/rules';
import {
  addCustomRule,
  addEvent,
  addGroupEvents,
  fantasyTotalByUser,
  removeCustomRule,
  removeEvent,
  resetAllEvents,
  resetPlayerEvents,
  totalsByPlayer,
  useAllTeams,
  useCustomRules,
  useEvents,
} from '../lib/store';
import { isDayLocked, setLockOverride } from '../lib/locking';
import type { Rule } from '../types';

const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || '9005';
const SESSION_KEY = 'fsu:adminUnlocked';

interface Props {
  userId: string;
}

export function AdminScreen({ userId }: Props) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === '1',
  );

  if (userId !== ADMIN_PLAYER_ID) {
    return (
      <div className="screen scroll">
        <div className="screen-pad">
          <Eyebrow>ADMIN</Eyebrow>
          <H1>Kun for Martin</H1>
          <p
            style={{
              fontFamily: 'var(--body)',
              fontSize: 15,
              color: 'var(--muted)',
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Kun Martin har tilgang til kontrollrommet.
          </p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <PinGate
        onPass={() => {
          sessionStorage.setItem(SESSION_KEY, '1');
          setUnlocked(true);
        }}
      />
    );
  }

  return <AdminPanel />;
}

function PinGate({ onPass }: { onPass: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === ADMIN_PIN) onPass();
      else {
        setError(true);
        const t = setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [pin, onPass]);

  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>ADMIN · KUN MARTIN</Eyebrow>
        <H1>Lås opp</H1>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 15,
            color: 'var(--muted)',
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Skriv inn PIN-koden på fire tall.
        </p>
        <input
          className="input"
          inputMode="numeric"
          autoFocus
          maxLength={4}
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          style={{
            marginTop: 22,
            borderColor: error ? 'var(--err)' : undefined,
          }}
          placeholder="••••"
        />
        {error && (
          <div
            style={{
              fontFamily: 'var(--body)',
              fontSize: 13,
              color: 'var(--err)',
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            Feil PIN.
          </div>
        )}
      </div>
    </div>
  );
}

type Tab = 'poeng' | 'gruppe' | 'regler' | 'events' | 'frist' | 'fasit';

function AdminPanel() {
  const [tab, setTab] = useState<Tab>('poeng');

  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>ADMIN · KUN MARTIN</Eyebrow>
        <H1>Kontrollrommet</H1>

        <div className="seg" style={{ marginTop: 16 }}>
          {(
            [
              ['poeng', 'Poeng'],
              ['gruppe', 'Gruppe'],
              ['regler', 'Regler'],
              ['events', 'Logg'],
              ['frist', 'Frist'],
              ['fasit', '🏆'],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              className={'seg-btn' + (tab === k ? ' active' : '')}
              onClick={() => setTab(k)}
              style={k === 'fasit' ? { color: tab === k ? 'var(--accent-gold)' : 'var(--muted)' } : {}}
            >
              {lbl}
            </button>
          ))}
        </div>

        {tab === 'poeng' && <PoengTab />}
        {tab === 'gruppe' && <GruppeTab />}
        {tab === 'regler' && <ReglerTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'frist' && <FristTab />}
        {tab === 'fasit' && <FasitTab />}

        {tab !== 'fasit' && (
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <button
              className="cta"
              style={{ background: 'var(--accent-gold)', gap: 8 }}
              onClick={() => setTab('fasit')}
            >
              🏆 Se hvem som vinner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PoengTab() {
  const events = useEvents();
  const customRules = useCustomRules();
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<'player' | 'all' | null>(null);

  function dayPts(pid: string) {
    return events
      .filter((e) => e.playerId === pid && e.dayId === SATURDAY_ID)
      .reduce((s, e) => s + e.pts, 0);
  }

  function handleResetPlayer() {
    if (!selected) return;
    resetPlayerEvents(selected);
    setConfirmReset(null);
    setToast(`Nullstilt poeng for ${PEOPLE_BY_ID[selected].name}`);
    setTimeout(() => setToast(null), 2000);
  }

  function handleResetAll() {
    resetAllEvents();
    setConfirmReset(null);
    setSelected(null);
    setToast('Alle poeng nullstilt');
    setTimeout(() => setToast(null), 2000);
  }

  const allRules: Rule[] = useMemo(
    () => [...RULES.filter((r) => !r.group), ...customRules],
    [customRules],
  );

  function register(rule: Rule) {
    if (!selected) return;
    addEvent({
      playerId: selected,
      dayId: SATURDAY_ID,
      ruleId: rule.id,
      ruleLabel: rule.label,
      pts: rule.pts,
      registeredBy: ADMIN_PLAYER_ID,
    });
    setToast(`${fmtPts(rule.pts)} til ${PEOPLE_BY_ID[selected].name}`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <>
      <Eyebrow style={{ marginTop: 22, marginBottom: 12 }}>VELG SPILLER</Eyebrow>
      <div className="admin-grid">
        {ALL_PEOPLE.map((p) => {
          const dPts = dayPts(p.id);
          const sel = selected === p.id;
          return (
            <div
              key={p.id}
              className="admin-cell"
              onClick={() => setSelected(sel ? null : p.id)}
              style={{ borderColor: sel ? 'var(--accent)' : 'transparent' }}
            >
              <Avatar id={p.id} size={42} />
              <div
                style={{
                  fontSize: 12.5,
                  fontFamily: 'var(--display)',
                  fontWeight: 600,
                  marginTop: 5,
                }}
              >
                {p.name}
              </div>
              <div
                className="num"
                style={{
                  fontSize: 11.5,
                  color: pointsColor(dPts),
                  marginTop: 1,
                }}
              >
                {dPts === 0 ? '·' : fmtPts(dPts)}
              </div>
            </div>
          );
        })}
      </div>

      {selected ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Eyebrow>
              REGISTRER POENG · {PEOPLE_BY_ID[selected].name.toUpperCase()}
            </Eyebrow>
            {confirmReset === 'player' ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="ghost-btn"
                  style={{ padding: '4px 12px', fontSize: 12, color: 'var(--err)', borderColor: 'var(--err)' }}
                  onClick={handleResetPlayer}
                >
                  Ja, slett
                </button>
                <button
                  className="ghost-btn"
                  style={{ padding: '4px 12px', fontSize: 12 }}
                  onClick={() => setConfirmReset(null)}
                >
                  Nei
                </button>
              </div>
            ) : (
              <button
                className="ghost-btn"
                style={{ padding: '4px 12px', fontSize: 12, color: 'var(--err)', borderColor: 'rgba(255,59,48,0.3)' }}
                onClick={() => setConfirmReset('player')}
              >
                Nullstill
              </button>
            )}
          </div>
          <div className="rules-list">
            {allRules.map((r) => (
              <div
                key={r.id}
                className={'rule-row tap' + (r.highlight ? ' hi' : '')}
                onClick={() => register(r)}
              >
                <div
                  style={{
                    flex: 1,
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    fontSize: 14.5,
                  }}
                >
                  {r.label}
                  {r.repeat && (
                    <span className="badge-mono"> · flere ganger</span>
                  )}
                  {r.custom && (
                    <span
                      className="badge-mono"
                      style={{ color: 'var(--accent)' }}
                    >
                      {' '}
                      · egen
                    </span>
                  )}
                </div>
                <span
                  className="num bold"
                  style={{ color: pointsColor(r.pts), fontSize: 15 }}
                >
                  {fmtPts(r.pts)}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: 'var(--body)',
              fontSize: 12.5,
              color: 'var(--muted)',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Trenger du en ny regel? Gå til <b>Regler</b>-fanen.
          </p>
        </div>
      ) : (
        <div
          style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: 28,
          }}
        >
          Velg en spiller for å registrere poeng.
        </div>
      )}

      {/* Reset alle */}
      <div style={{ marginTop: 32, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 20 }}>
        {confirmReset === 'all' ? (
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Er du sikker?
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              Alle registrerte poeng for alle spillere blir slettet permanent.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="ghost-btn"
                style={{ flex: 1, color: 'var(--err)', borderColor: 'var(--err)' }}
                onClick={handleResetAll}
              >
                Ja, slett alt
              </button>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setConfirmReset(null)}>
                Nei
              </button>
            </div>
          </div>
        ) : (
          <button
            className="ghost-btn"
            style={{ width: '100%', color: 'var(--err)', borderColor: 'rgba(255,59,48,0.3)' }}
            onClick={() => setConfirmReset('all')}
          >
            🗑 Reset alle poeng
          </button>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function GruppeTab() {
  const [toast, setToast] = useState<string | null>(null);
  const groupRules = useMemo(() => RULES.filter((r) => r.group), []);

  function register(ruleId: string) {
    const rule = RULES.find((r) => r.id === ruleId);
    if (!rule) return;
    addGroupEvents({
      dayId: SATURDAY_ID,
      ruleId: rule.id,
      ruleLabel: rule.label,
      pts: rule.pts,
      registeredBy: ADMIN_PLAYER_ID,
    });
    setToast(`${fmtPts(rule.pts)} til alle ${PLAYERS.length} spillerne`);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <>
      <p
        style={{
          fontFamily: 'var(--body)',
          fontSize: 14,
          color: 'var(--muted)',
          marginTop: 22,
          lineHeight: 1.5,
        }}
      >
        Gruppeutfordringer — alle 7 spillerne (inkl. Stian) får poenget i ett
        trykk.
      </p>

      <div className="rules-list" style={{ marginTop: 12 }}>
        {groupRules.map((r) => (
          <div
            key={r.id}
            className="rule-row tap hi"
            onClick={() => register(r.id)}
          >
            <div
              style={{
                flex: 1,
                fontFamily: 'var(--display)',
                fontWeight: 600,
                fontSize: 14.5,
              }}
            >
              {r.label}
              {r.repeat && <span className="badge-mono"> · flere ganger</span>}
            </div>
            <span
              className="num bold"
              style={{ color: pointsColor(r.pts), fontSize: 15 }}
            >
              {fmtPts(r.pts)}
            </span>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function ReglerTab() {
  const customRules = useCustomRules();
  const [label, setLabel] = useState('');
  const [pts, setPts] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = label.trim();
    const num = Number(pts);
    if (!trimmed) return setError('Trenger en tekst.');
    if (!Number.isInteger(num) || num === 0)
      return setError('Poeng må være et helt tall (kan være negativt).');
    addCustomRule({
      label: trimmed,
      pts: num,
      cat: 'egen',
      createdBy: ADMIN_PLAYER_ID,
    });
    setLabel('');
    setPts('');
  }

  return (
    <>
      <Eyebrow style={{ marginTop: 22, marginBottom: 8 }}>NY REGEL</Eyebrow>
      <p
        style={{
          fontFamily: 'var(--body)',
          fontSize: 13.5,
          color: 'var(--muted)',
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        Lag en regel ad hoc — f.eks. "1.-plass minigolf" +15. Den dukker opp
        nederst i Poeng-lista og i Regelboka.
      </p>

      <form
        onSubmit={submit}
        style={{
          background: 'var(--card)',
          padding: 14,
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tekst (f.eks. Vant minigolf)"
          maxLength={80}
          style={{
            padding: '12px 14px',
            border: '1.5px solid transparent',
            borderRadius: 10,
            background: 'var(--bg)',
            fontFamily: 'var(--body)',
            fontSize: 15,
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        <input
          type="number"
          inputMode="numeric"
          value={pts}
          onChange={(e) => setPts(e.target.value)}
          placeholder="Poeng (negative tall tillatt, f.eks. -5)"
          style={{
            padding: '12px 14px',
            border: '1.5px solid transparent',
            borderRadius: 10,
            background: 'var(--bg)',
            fontFamily: 'var(--mono)',
            fontSize: 15,
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        {error && (
          <div
            style={{
              fontFamily: 'var(--body)',
              fontSize: 13,
              color: 'var(--err)',
            }}
          >
            {error}
          </div>
        )}
        <button type="submit" className="cta" style={{ borderRadius: 10 }}>
          Legg til regel
        </button>
      </form>

      <Eyebrow style={{ marginTop: 22, marginBottom: 10 }}>
        EGNE REGLER ({customRules.length})
      </Eyebrow>
      {customRules.length === 0 ? (
        <div
          style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--muted)',
            textAlign: 'center',
            padding: 18,
          }}
        >
          Ingen egne regler ennå.
        </div>
      ) : (
        <div className="rules-list">
          {customRules.map((r) => (
            <div key={r.id} className="rule-row">
              <div
                style={{
                  flex: 1,
                  fontFamily: 'var(--display)',
                  fontWeight: 600,
                  fontSize: 14.5,
                }}
              >
                {r.label}
              </div>
              <span
                className="num bold"
                style={{
                  color: pointsColor(r.pts),
                  fontSize: 15,
                  marginRight: 10,
                }}
              >
                {fmtPts(r.pts)}
              </span>
              <button
                onClick={() => removeCustomRule(r.id)}
                aria-label="Slett regel"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EventsTab() {
  const events = useEvents();
  const recent = events.slice(0, 30);
  return (
    <div style={{ marginTop: 18 }}>
      <Eyebrow style={{ marginBottom: 10 }}>SISTE REGISTRERTE</Eyebrow>
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
          Ingen hendelser ennå.
        </div>
      )}
      {recent.map((e) => (
        <div
          key={e.id}
          className="rule-row"
          style={{ background: 'var(--card)', borderRadius: 12, marginBottom: 6 }}
        >
          <Avatar id={e.playerId} size={28} />
          <div style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {PEOPLE_BY_ID[e.playerId]?.name ?? e.playerId}
              {e.groupBatchId && <span className="badge-mono"> · gruppe</span>}
            </div>
            <div
              style={{
                fontFamily: 'var(--body)',
                fontSize: 12.5,
                color: 'var(--muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {e.ruleLabel}
            </div>
          </div>
          <span
            className="num bold"
            style={{ color: pointsColor(e.pts), marginRight: 8 }}
          >
            {fmtPts(e.pts)}
          </span>
          <button
            onClick={() => removeEvent(e.id)}
            aria-label="Slett"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 16,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function fasitRank(sorted: { fantasyTotal: number }[], i: number): number {
  const score = sorted[i].fantasyTotal;
  return sorted.findIndex((r) => r.fantasyTotal === score) + 1;
}

function FasitTab() {
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

  const sortedByReal = useMemo(
    () =>
      [...PLAYERS].sort(
        (a, b) => (rawTotals[b.id]?.perDay['lor'] ?? 0) - (rawTotals[a.id]?.perDay['lor'] ?? 0),
      ),
    [rawTotals],
  );

  const hasScores = standings.some((r) => r.fantasyTotal !== 0);
  const topScore = standings[0]?.fantasyTotal ?? 0;
  const winners = hasScores ? standings.filter((r) => r.fantasyTotal === topScore) : [];

  return (
    <>
      <div style={{ marginTop: 28, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>🏆</div>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontWeight: 400,
            fontSize: winners.length > 1 ? 28 : 38,
            lineHeight: 1.1,
            marginTop: 10,
          }}
        >
          {winners.length > 0 ? winners.map((w) => w.p.name).join(' & ') : '—'}
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 22,
            color: 'var(--accent-gold)',
            fontWeight: 600,
            marginTop: 6,
          }}
        >
          {fmtPts(hasScores ? topScore : 0)}
        </div>
        <div
          style={{
            fontFamily: 'var(--body)',
            fontSize: 13,
            color: 'var(--muted)',
            marginTop: 4,
          }}
        >
          {winners.length > 1
            ? 'Delt førsteplass 🎉'
            : winners.length === 1
              ? 'Fantasy-vinner 🎉'
              : 'Ingen poeng registrert ennå.'}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>SLUTTRESULTAT · FANTASY</Eyebrow>
        {standings.map((row, i) => {
          const team = row.team;
          const rank = fasitRank(standings, i);
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

      <div style={{ marginTop: 28 }}>
        <Eyebrow style={{ marginBottom: 10 }}>FAKTISKE POENG · SPILLERNE</Eyebrow>
        <div className="rules-list">
          {sortedByReal.map((p) => {
            const pts = rawTotals[p.id]?.perDay['lor'] ?? 0;
            return (
              <div key={p.id} className="rule-row">
                <Avatar id={p.id} size={30} />
                <span
                  style={{
                    flex: 1,
                    marginLeft: 6,
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {p.name}
                </span>
                <span
                  className="num bold"
                  style={{ color: pointsColor(pts), fontSize: 15 }}
                >
                  {pts === 0 ? '·' : fmtPts(pts)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FristTab() {
  const [, force] = useState(0);
  const locked = isDayLocked(SATURDAY_ID);
  return (
    <div style={{ marginTop: 22 }}>
      <p
        style={{
          fontFamily: 'var(--body)',
          fontSize: 13.5,
          color: 'var(--muted)',
          lineHeight: 1.5,
          marginBottom: 14,
        }}
      >
        Lørdag låses kl. {SATURDAY.deadline} på bryllupsdagen ({SATURDAY.date}).
        Du kan tvinge den åpen eller låst for testing.
      </p>
      <div className="card" style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Eyebrow>
              {SATURDAY.long.toUpperCase()} · {SATURDAY.date.toUpperCase()}
            </Eyebrow>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontWeight: 700,
                fontSize: 18,
                marginTop: 4,
              }}
            >
              {SATURDAY.deadline}
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 999,
              background: locked ? 'var(--accent-soft)' : 'var(--card-soft)',
              color: locked ? 'var(--err)' : 'var(--ok)',
            }}
          >
            {locked ? 'LÅST' : 'ÅPEN'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            className="ghost-btn"
            style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}
            onClick={() => {
              setLockOverride(SATURDAY_ID, locked ? false : undefined);
              force((x) => x + 1);
            }}
          >
            {locked ? 'Tving åpen' : '✓ Åpen'}
          </button>
          <button
            className="ghost-btn"
            style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}
            onClick={() => {
              setLockOverride(SATURDAY_ID, locked ? undefined : true);
              force((x) => x + 1);
            }}
          >
            {locked ? '✓ Låst' : 'Tving låst'}
          </button>
        </div>
      </div>
    </div>
  );
}
