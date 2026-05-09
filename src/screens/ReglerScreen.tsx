import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { CATEGORIES, RULES } from '../data/rules';

export function ReglerScreen() {
  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <div>
          <Eyebrow>REGELBOK</Eyebrow>
          <H1>Sånn funker det</H1>
        </div>

        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 16,
            lineHeight: 1.5,
            marginTop: 14,
          }}
        >
          Du setter opp et lag på <b>fire av sju</b> medreisende hver dag. Du kan
          ikke velge deg selv, men du kan velge Stian. Én utpekes som{' '}
          <b>kaptein</b> og scoren dobles.
        </p>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Folk samler atferdspoeng i virkeligheten. Martin registrerer dem
          fortløpende. Dine poeng er summen av de fire valgte sin score den
          dagen.
        </p>

        <div className="rule-section">
          <Eyebrow style={{ marginBottom: 6 }}>FRISTER</Eyebrow>
          <ul className="bullet">
            <li>
              <b>Fredag</b> låses kl. 12:00
            </li>
            <li>
              <b>Lørdag, søndag</b> låses kl. 09:00
            </li>
          </ul>
          <div
            style={{
              fontFamily: 'var(--body)',
              fontSize: 14,
              color: 'var(--muted)',
              marginTop: 6,
            }}
          >
            Misser du fristen, videreføres laget fra i går automatisk — kaptein
            og alt.
          </div>
        </div>

        {CATEGORIES.map((cat) => {
          const items = RULES.filter((r) => r.cat === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id} className="rule-section">
              <Eyebrow style={{ marginBottom: 4 }}>
                {cat.label.toUpperCase()}
              </Eyebrow>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  fontFamily: 'var(--body)',
                  marginBottom: 8,
                }}
              >
                {cat.sub}
              </div>
              <div className="rules-list">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className={'rule-row' + (r.highlight ? ' hi' : '')}
                  >
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontFamily: 'var(--display)',
                          fontWeight: 600,
                          fontSize: 15,
                        }}
                      >
                        {r.label}
                      </span>
                      {r.repeat && (
                        <span className="badge-mono"> · flere ganger</span>
                      )}
                      {r.group && (
                        <span className="badge-mono"> · alle scorer</span>
                      )}
                    </div>
                    <span
                      className="num bold"
                      style={{ color: pointsColor(r.pts), fontSize: 16 }}
                    >
                      {fmtPts(r.pts)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
