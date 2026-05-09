import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Eyebrow } from '../components/ui';
import { ALL_PEOPLE, PLAYERS } from '../data/players';
import { setCurrentUserId } from '../lib/store';
import { FIREBASE_ENABLED } from '../lib/firebase';
import { loginWithGoogle, logout, useFirebaseAuth } from '../lib/auth';

export function SplashScreen() {
  const auth = useFirebaseAuth();
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated, but email isn't mapped to a player.
  if (auth.unknownEmail) {
    return (
      <div className="screen scroll" style={{ paddingBottom: 40 }}>
        <div className="screen-pad">
          <Eyebrow>UKJENT BRUKER</Eyebrow>
          <h1 className="h1" style={{ marginTop: 4 }}>
            Du står ikke på lista
          </h1>
          <p
            style={{
              fontFamily: 'var(--body)',
              fontSize: 15,
              color: 'var(--muted)',
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Email-en <b>{auth.unknownEmail}</b> er ikke registrert som spiller.
            Be Martin legge deg til.
          </p>
          <button
            className="ghost-btn"
            style={{ marginTop: 22, width: '100%' }}
            onClick={logout}
          >
            Logg ut
          </button>
        </div>
      </div>
    );
  }

  if (picking) return <PlayerPicker onCancel={() => setPicking(false)} />;

  async function handleGoogleLogin() {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Noe gikk galt.';
      setError(msg);
    }
  }

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
          Utdrikningslag
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
          Lag dæ lørdagens vinnerlag, og få poeng utfra den ekte oppførselen
          te folk.
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

      <div>
        {FIREBASE_ENABLED ? (
          <button
            className="cta"
            onClick={handleGoogleLogin}
            disabled={auth.loading}
          >
            <GoogleG />
            Logg inn med Google
          </button>
        ) : (
          <button className="cta" onClick={() => setPicking(true)}>
            Velg spiller (demo-modus)
          </button>
        )}
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
            {error}
          </div>
        )}
      </div>
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
          Demo-modus — Firebase er ikke konfigurert.
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

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.78 2.72v2.26h2.88c1.69-1.55 2.66-3.84 2.66-6.62z"
      />
      <path
        fill="#FF3D00"
        d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.88-2.26c-.8.54-1.83.86-3.07.86-2.36 0-4.36-1.6-5.07-3.74H.93v2.34A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#4CAF50"
        d="M3.93 10.68A5.4 5.4 0 0 1 3.64 9c0-.58.1-1.15.27-1.68V4.98H.93A8.997 8.997 0 0 0 0 9c0 1.45.35 2.82.93 4.02l3-2.34z"
      />
      <path
        fill="#1976D2"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .93 4.98l3 2.34C4.64 5.18 6.64 3.58 9 3.58z"
      />
    </svg>
  );
}
