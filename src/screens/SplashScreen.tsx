import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow } from '../components/ui';
import { ALL_PEOPLE, PLAYERS } from '../data/players';
import { setCurrentUserId } from '../lib/store';

export function SplashScreen() {
  const [picking, setPicking] = useState(false);

  if (picking) return <PlayerPicker onCancel={() => setPicking(false)} />;

  return (
    <div
      className="screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 28px 40px',
        minHeight: '100dvh',
      }}
    >
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Eyebrow>OSLO · FRE TIL SØN, JULI 2026</Eyebrow>
        <h1
          className="h1"
          style={{ fontSize: 66, lineHeight: 0.9, marginTop: 18, marginBottom: 4 }}
        >
          Fantasy
        </h1>
        <h1
          className="h1"
          style={{
            fontSize: 38,
            lineHeight: 0.95,
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontWeight: 400,
            marginTop: 8,
          }}
        >
          Stian sett
        </h1>
        <h1
          className="h1"
          style={{
            fontSize: 38,
            lineHeight: 0.95,
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontWeight: 400,
          }}
        >
          utdrekningslag
        </h1>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 16,
            color: 'var(--muted)',
            marginTop: 22,
            lineHeight: 1.45,
            padding: '0 14px',
          }}
        >
          Lag dæ ditt daglige vinnerlag, og tjen ekte poeng førr oppførselen til
          de enkelte.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          flexWrap: 'wrap',
          maxWidth: 280,
          margin: '0 auto',
          marginBottom: 20,
        }}
      >
        {ALL_PEOPLE.map((p) => (
          <div key={p.id} style={{ padding: 4 }}>
            <Avatar id={p.id} size={p.id === 'stian' ? 60 : 48} />
          </div>
        ))}
      </div>

      <button className="cta" onClick={() => setPicking(true)}>
        Logg inn
      </button>
    </div>
  );
}

function PlayerPicker({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="screen scroll" style={{ paddingBottom: 40 }}>
      <div className="screen-pad">
        <Eyebrow>HVEM ER DU?</Eyebrow>
        <h1 className="h1" style={{ marginTop: 4 }}>
          Velg din spiller
        </h1>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 14,
            color: 'var(--muted)',
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Stian er hovedperson og spiller ikke. Trykk på deg selv.
        </p>

        <div className="player-pick">
          {PLAYERS.map((p) => (
            <button
              key={p.id}
              className="player-pick-cell"
              onClick={() => setCurrentUserId(p.id)}
            >
              <Avatar id={p.id} size={64} />
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--body)',
                  fontSize: 11.5,
                  color: 'var(--muted)',
                }}
              >
                {p.nick}
              </div>
            </button>
          ))}
        </div>

        <button
          className="ghost-btn"
          style={{ marginTop: 22, width: '100%' }}
          onClick={onCancel}
        >
          Tilbake
        </button>
      </div>
    </div>
  );
}
