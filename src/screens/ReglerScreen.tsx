import { Eyebrow, H1, fmtPts, pointsColor } from '../components/ui';
import { CATEGORIES, RULES } from '../data/rules';
import { useCustomRules } from '../lib/store';
import type { Rule } from '../types';

export function ReglerScreen() {
  const customRules = useCustomRules();
  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <div>
          <Eyebrow>REGLER</Eyebrow>
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
          Du setter opp et lag på <b>fire av de andre</b> for lørdag. Du kan
          ikke velge deg selv, men du kan velge Stian. Du peker selv ut hvem
          som er <b>kaptein</b> — kapteinen sin score dobles.
        </p>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Du samler poeng basert på hva de fire du valgte faktisk gjør. Martin
          registrerer hendelsene underveis.
        </p>

        {CATEGORIES.map((cat) => {
          const items: Rule[] =
            cat.id === 'egen'
              ? customRules
              : RULES.filter((r) => r.cat === cat.id);
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
