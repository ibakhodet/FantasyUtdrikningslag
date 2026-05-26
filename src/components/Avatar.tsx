import { PEOPLE_BY_ID } from '../data/players';

interface Props {
  id: string;
  size?: number;
  ring?: boolean;
  captain?: boolean;
  dim?: boolean;
}

export function Avatar({ id, size = 56, ring = false, captain = false, dim = false }: Props) {
  const p = PEOPLE_BY_ID[id];
  if (!p) return null;
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        opacity: dim ? 0.45 : 1,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: p.color,
          backgroundImage: p.photo
            ? `url(${import.meta.env.BASE_URL}${p.photo})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow:
            '0 2px 4px rgba(0,0,0,0.12), inset 0 0 0 2px rgba(255,255,255,0.6)',
          outline: ring ? '2.5px solid var(--accent)' : 'none',
          outlineOffset: 2,
        }}
      />
      {captain && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            background: 'var(--accent-gold)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.18,
            fontWeight: 700,
            border: '2px solid var(--bg)',
          }}
        >
          K
        </div>
      )}
      {p.id === 'stian' && (
        <div
          style={{
            position: 'absolute',
            bottom: -3,
            right: -3,
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.22,
            border: '2px solid var(--bg)',
          }}
        >
          ♛
        </div>
      )}
    </div>
  );
}
