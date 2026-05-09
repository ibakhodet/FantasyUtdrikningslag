import { Eyebrow, H1 } from '../components/ui';
import { DAYS } from '../data/days';
import { PROGRAM } from '../data/program';

export function ProgramScreen() {
  return (
    <div className="screen scroll">
      <div className="screen-pad">
        <Eyebrow>OSLO · LØRDAG 30. MAI</Eyebrow>
        <H1>Programmet</H1>
        <p
          style={{
            fontFamily: 'var(--body)',
            fontSize: 15,
            color: 'var(--muted)',
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Stian vet kun at han skal "en tur". Resten er hemmelig.
        </p>

        {DAYS.map((d) => {
          const items = PROGRAM.filter((p) => p.day === d.id);
          return (
            <div key={d.id} className="prog-day">
              <div className="prog-day-head">
                <div>
                  <Eyebrow>{d.date.toUpperCase()}</Eyebrow>
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 700,
                      fontSize: 22,
                      marginTop: 2,
                    }}
                  >
                    {d.long}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--muted)',
                  }}
                >
                  {items.length} HENDELSER
                </div>
              </div>
              <div className="prog-items">
                {items.map((p, i) => (
                  <div key={i} className="prog-item">
                    <div className="prog-time">{p.time}</div>
                    <div className="prog-emoji">{p.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: 'var(--display)',
                          fontWeight: 600,
                          fontSize: 15,
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--body)',
                          fontSize: 13,
                          color: 'var(--muted)',
                          marginTop: 1,
                        }}
                      >
                        {p.desc}
                      </div>
                    </div>
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
