import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { DayTabs, Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { ALL_PEOPLE, PEOPLE_BY_ID, PLAYERS, ADMIN_PLAYER_ID } from '../data/players';
import { DAYS } from '../data/days';
import { RULES } from '../data/rules';
import {
  addEvent,
  addGroupEvents,
  removeEvent,
  useEvents,
} from '../lib/store';
import { getLockOverrides, isDayLocked, setLockOverride } from '../lib/locking';
import type { DayId } from '../types';

const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || '1234';
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
            Kun Martin har tilgang til kontrollrommet. Logg inn som Martin om du
            er han.
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
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
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

type Tab = 'poeng' | 'gruppe' | 'events' | 'frister';

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
              ['events', 'Events'],
              ['frister', 'Frister'],
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

        {tab === 'poeng' && <PoengTab />}
        {tab === 'gruppe' && <GruppeTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'frister' && <FristerTab />}
      </div>
    </div>
  );
}

function PoengTab() {
  const events = useEvents();
  const [day, setDay] = useState<DayId>('lor');
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function dayPts(pid: string) {
    return events
      .filter((e) => e.playerId === pid && e.dayId === day)
      .reduce((s, e) => s + e.pts, 0);
  }

  function register(ruleId: string) {
    if (!selected) return;
    const rule = RULES.find((r) => r.id === ruleId);
    if (!rule) return;
    addEvent({
      playerId: selected,
      dayId: day,
      ruleId: rule.id,
      ruleLabel: rule.label,
      pts: rule.pts,
      registeredBy: ADMIN_PLAYER_ID,
    });
    setToast(`${fmtPts(rule.pts)} til ${PEOPLE_BY_ID[selected].name}`);
    setTimeout(() => setToast(null), 1500);
  }

  const individualRules = useMemo(
    () => RULES.filter((r) => !r.group),
    [],
  );

  return (
    <>
      <Eyebrow style={{ marginTop: 22, marginBottom: 10 }}>1. VELG DAG</Eyebrow>
      <DayTabs activeDay={day} setActiveDay={setDay} />

      <Eyebrow style={{ marginTop: 22, marginBottom: 12 }}>
        2. VELG SPILLER
      </Eyebrow>
      <div className="admin-grid">
        {ALL_PEOPLE.map((p) => {
          const dPts = dayPts(p.id);
          const sel = selected === p.id;
          return (
            <div
              key={p.id}
              className="admin-cell"
              onClick={() => setSelected(sel ? null : p.id)}
              style={{
                borderColor: sel ? 'var(--accent)' : 'transparent',
              }}
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
          <Eyebrow style={{ marginBottom: 10 }}>
            3. REGISTRER POENG · {PEOPLE_BY_ID[selected].name.toUpperCase()}
          </Eyebrow>
          <div className="rules-list">
            {individualRules.map((r) => (
              <div
                key={r.id}
                className={'rule-row tap' + (r.highlight ? ' hi' : '')}
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
                  {r.repeat && (
                    <span className="badge-mono"> · flere ganger</span>
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

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function GruppeTab() {
  const [day, setDay] = useState<DayId>('lor');
  const [toast, setToast] = useState<string | null>(null);
  const groupRules = useMemo(() => RULES.filter((r) => r.group), []);

  function register(ruleId: string) {
    const rule = RULES.find((r) => r.id === ruleId);
    if (!rule) return;
    addGroupEvents({
      dayId: day,
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
      <Eyebrow style={{ marginTop: 22, marginBottom: 10 }}>1. VELG DAG</Eyebrow>
      <DayTabs activeDay={day} setActiveDay={setDay} />

      <p
        style={{
          fontFamily: 'var(--body)',
          fontSize: 14,
          color: 'var(--muted)',
          marginTop: 18,
          lineHeight: 1.5,
        }}
      >
        Trykk på en gruppeutfordring — alle 6 spillerne får poenget. (Stian er
        hovedperson og scorer ikke.)
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
              {e.groupBatchId && (
                <span className="badge-mono"> · gruppe</span>
              )}
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

function FristerTab() {
  const [, force] = useState(0);
  const overrides = getLockOverrides();
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
        Frister er hardkodet til reelle datoer i juli 2026. Du kan tvinge en dag
        låst eller åpen for testing.
      </p>
      {DAYS.map((d) => {
        const locked = isDayLocked(d.id);
        const override = overrides[d.id];
        return (
          <div key={d.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Eyebrow>
                  {d.long.toUpperCase()} · {d.date.toUpperCase()}
                </Eyebrow>
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 700,
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  {d.deadline}
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
                  setLockOverride(
                    d.id,
                    override === false ? undefined : false,
                  );
                  force((x) => x + 1);
                }}
              >
                {override === false ? '✓ Tvunget åpen' : 'Tving åpen'}
              </button>
              <button
                className="ghost-btn"
                style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}
                onClick={() => {
                  setLockOverride(
                    d.id,
                    override === true ? undefined : true,
                  );
                  force((x) => x + 1);
                }}
              >
                {override === true ? '✓ Tvunget låst' : 'Tving låst'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
