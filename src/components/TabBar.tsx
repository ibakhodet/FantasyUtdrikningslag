import type { TabId } from '../App';

const ICONS: Record<TabId, string> = {
  lag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M14 18c.5-2.4 2.5-4.2 4.5-4.5"/></svg>`,
  tabell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 21V8M12 21V4M19 21v-9"/><path d="M3 21h18"/></svg>`,
  program: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>`,
  regler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/></svg>`,
  admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.4-3.5 8.2-8 9-4.5-.8-8-4.6-8-9V6l8-3z"/></svg>`,
  profil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>`,
};

const LABELS: Record<TabId, string> = {
  lag: 'Lag',
  tabell: 'Tabell',
  program: 'Program',
  regler: 'Regler',
  admin: 'Admin',
  profil: 'Profil',
};

interface Props {
  active: TabId;
  setActive: (t: TabId) => void;
  tabs: TabId[];
}

export function TabBar({ active, setActive, tabs }: Props) {
  return (
    <div className="tabbar">
      {tabs.map((id) => (
        <button
          key={id}
          className={'tab' + (active === id ? ' on' : '')}
          onClick={() => setActive(id)}
        >
          <div className="tab-ico" dangerouslySetInnerHTML={{ __html: ICONS[id] }} />
          <div className="tab-lbl">{LABELS[id]}</div>
        </button>
      ))}
    </div>
  );
}
